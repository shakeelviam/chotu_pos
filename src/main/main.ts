console.log('MAIN PROCESS STARTING - ' + new Date().toISOString());

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { initDatabase, getDatabase } from './database';
import { Config } from './services/config';
import { registerAllHandlers } from './handlers/register-handlers';

// Set environment variables before anything else
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
process.env.ELECTRON_NO_ATTACH_CONSOLE = 'true';
process.env.MESA_DEBUG = 'silent';
process.env.MESA_GLSL_CACHE_DISABLE = 'true';
process.env.LIBGL_DRI3_DISABLE = '1';
process.env.MESA_NO_ERROR = '1';
process.env.MESA_LOADER_DRIVER_OVERRIDE = 'i965';
process.env.LIBGL_ALWAYS_SOFTWARE = '1';  // Force software rendering
process.env.ELECTRON_DISABLE_GPU = '1';   // Disable GPU at process level

// Disable all GPU features that might cause warnings
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('use-gl', 'swiftshader');  // Use software rendering
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-vulkan');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('disable-gpu-memory-buffer-compositor');  // Disable GPU memory buffers
app.commandLine.appendSwitch('disable-accelerated-2d-canvas');  // Disable accelerated 2D canvas

// Suppress all GPU-related warnings
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('Haswell') || 
      message.includes('Vulkan') || 
      message.includes('MESA') || 
      message.includes('CreateInstance') ||
      message.includes('terminator') ||
      message.includes('gl_') ||
      message.includes('[WARNING:') ||
      message.includes('ICD')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Haswell') || 
      message.includes('Vulkan') || 
      message.includes('MESA') || 
      message.includes('CreateInstance') ||
      message.includes('terminator') ||
      message.includes('gl_') ||
      message.includes('[WARNING:') ||
      message.includes('ICD')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Log any unhandled errors (except GPU warnings)
process.on('uncaughtException', (error) => {
  if (!error.message?.includes('GPU') && 
      !error.message?.includes('Vulkan') && 
      !error.message?.includes('MESA') &&
      !error.message?.includes('ICD')) {
    console.error('Uncaught exception:', error);
  }
});

process.on('unhandledRejection', (error) => {
  if (!error?.toString().includes('GPU') && 
      !error?.toString().includes('Vulkan') && 
      !error?.toString().includes('MESA') &&
      !error?.toString().includes('ICD')) {
    console.error('Unhandled rejection:', error);
  }
});

console.log('Starting application...');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Initialize config
const config = Config.getInstance();

// Initialize database
console.log('Initializing database...');
initDatabase();
const db = getDatabase();

console.log('Registering IPC handlers...');
registerAllHandlers(db, config);

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Set application name
  app.name = 'Chotu POS';
  
  console.log('Starting application...');
  
  console.log('App is ready, creating window...');
  await createWindow();

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

async function createWindow() {
  console.log('Creating window...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      offscreen: false
    }
  });

  // Register window control handlers
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  if (process.env.NODE_ENV === 'development') {
    // Wait for preload script to be ready
    await new Promise<void>((resolve) => {
      const checkPreload = () => {
        if (mainWindow?.webContents && mainWindow?.webContents.session) {
          resolve();
        } else {
          setTimeout(checkPreload, 100);
        }
      };
      checkPreload();
    });
    
    await mainWindow.loadURL('http://localhost:3006');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../renderer/out/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Disable vsync
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow?.webContents.setFrameRate(60);
  });

  // Dereference the window object when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

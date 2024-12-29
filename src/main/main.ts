console.log('MAIN PROCESS STARTING - ' + new Date().toISOString());

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { registerAuthHandlers } from './handlers/auth';
import { registerCustomerHandlers } from './handlers/customers';
import { registerItemHandlers } from './handlers/items';
import { registerSalesHandlers } from './handlers/sales';
import { registerSyncHandlers } from './handlers/sync';
import { registerPOSOpeningHandlers } from './handlers/pos-opening';
import { initDatabase } from './database';

// Disable GPU acceleration and hardware acceleration
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Disable various GPU features that might cause warnings
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('use-gl', 'desktop');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');

// Environment variables for suppressing warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
process.env.ELECTRON_NO_ATTACH_CONSOLE = 'true';
process.env.MESA_DEBUG = 'silent';

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
      message.includes('[WARNING:')) {
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
      message.includes('[WARNING:')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Log any unhandled errors (except GPU warnings)
process.on('uncaughtException', (error) => {
  if (!error.message?.includes('GPU') && 
      !error.message?.includes('Vulkan') && 
      !error.message?.includes('MESA')) {
    console.error('Uncaught exception:', error);
  }
});

process.on('unhandledRejection', (error) => {
  if (!error?.toString().includes('GPU') && 
      !error?.toString().includes('Vulkan') && 
      !error?.toString().includes('MESA')) {
    console.error('Unhandled rejection:', error);
  }
});

console.log('Starting application...');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Mock data for testing
const MOCK_ITEMS = [{ item_code: 'TEST1', item_name: 'Test Item', description: 'Test Description', standard_rate: 10, current_stock: 100, barcode: '123' }];
const DEFAULT_CUSTOMER = { id: 1, name: 'Walk-in Customer', mobile: '0000000000' };

console.log('Registering IPC handlers...');

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

  // Initialize database
  await initDatabase();

  // Register all handlers
  registerAuthHandlers();
  registerCustomerHandlers();
  registerItemHandlers();
  registerSalesHandlers();
  registerSyncHandlers();
  registerPOSOpeningHandlers();

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

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Set application name
  app.name = 'Chotu POS';
  
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

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

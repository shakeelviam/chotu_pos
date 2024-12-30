"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('MAIN PROCESS STARTING - ' + new Date().toISOString());
const electron_1 = require("electron");
const path = require("path");
const database_1 = require("./database");
const config_1 = require("./services/config");
const register_handlers_1 = require("./handlers/register-handlers");
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
process.env.ELECTRON_NO_ATTACH_CONSOLE = 'true';
process.env.MESA_DEBUG = 'silent';
process.env.MESA_GLSL_CACHE_DISABLE = 'true';
process.env.LIBGL_DRI3_DISABLE = '1';
process.env.MESA_NO_ERROR = '1';
process.env.MESA_LOADER_DRIVER_OVERRIDE = 'i965';
process.env.LIBGL_ALWAYS_SOFTWARE = '1';
process.env.ELECTRON_DISABLE_GPU = '1';
electron_1.app.disableHardwareAcceleration();
electron_1.app.commandLine.appendSwitch('disable-gpu');
electron_1.app.commandLine.appendSwitch('disable-gpu-compositing');
electron_1.app.commandLine.appendSwitch('disable-gpu-rasterization');
electron_1.app.commandLine.appendSwitch('disable-gpu-sandbox');
electron_1.app.commandLine.appendSwitch('disable-software-rasterizer');
electron_1.app.commandLine.appendSwitch('use-gl', 'swiftshader');
electron_1.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
electron_1.app.commandLine.appendSwitch('ignore-gpu-blocklist');
electron_1.app.commandLine.appendSwitch('disable-vulkan');
electron_1.app.commandLine.appendSwitch('no-sandbox');
electron_1.app.commandLine.appendSwitch('disable-dev-shm-usage');
electron_1.app.commandLine.appendSwitch('disable-gpu-memory-buffer-compositor');
electron_1.app.commandLine.appendSwitch('disable-accelerated-2d-canvas');
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
let mainWindow = null;
const config = config_1.Config.getInstance();
console.log('Initializing database...');
(0, database_1.initDatabase)();
const db = (0, database_1.getDatabase)();
console.log('Registering IPC handlers...');
(0, register_handlers_1.registerAllHandlers)(db, config);
electron_1.app.whenReady().then(async () => {
    electron_1.app.name = 'Chotu POS';
    console.log('Starting application...');
    console.log('App is ready, creating window...');
    await createWindow();
    electron_1.app.on('activate', async function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});
async function createWindow() {
    console.log('Creating window...');
    mainWindow = new electron_1.BrowserWindow({
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
    electron_1.ipcMain.handle('window:minimize', () => {
        mainWindow?.minimize();
    });
    electron_1.ipcMain.handle('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow?.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.handle('window:close', () => {
        mainWindow?.close();
    });
    if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => {
            const checkPreload = () => {
                if (mainWindow?.webContents && mainWindow?.webContents.session) {
                    resolve();
                }
                else {
                    setTimeout(checkPreload, 100);
                }
            };
            checkPreload();
        });
        await mainWindow.loadURL('http://localhost:3006');
        mainWindow.webContents.openDevTools();
    }
    else {
        await mainWindow.loadFile(path.join(__dirname, '../../renderer/out/index.html'));
    }
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Window loaded successfully');
    });
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });
    mainWindow.webContents.on('dom-ready', () => {
        mainWindow?.webContents.setFrameRate(60);
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map
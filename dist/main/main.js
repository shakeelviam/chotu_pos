"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('MAIN PROCESS STARTING - ' + new Date().toISOString());
const electron_1 = require("electron");
const path = require("path");
const auth_1 = require("./handlers/auth");
const customers_1 = require("./handlers/customers");
const items_1 = require("./handlers/items");
const sales_1 = require("./handlers/sales");
const sync_1 = require("./handlers/sync");
const pos_opening_1 = require("./handlers/pos-opening");
const database_1 = require("./database");
electron_1.app.disableHardwareAcceleration();
electron_1.app.commandLine.appendSwitch('disable-gpu');
electron_1.app.commandLine.appendSwitch('disable-software-rasterizer');
electron_1.app.commandLine.appendSwitch('disable-gpu-compositing');
electron_1.app.commandLine.appendSwitch('disable-gpu-rasterization');
electron_1.app.commandLine.appendSwitch('disable-gpu-sandbox');
electron_1.app.commandLine.appendSwitch('use-gl', 'desktop');
electron_1.app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
process.env.ELECTRON_NO_ATTACH_CONSOLE = 'true';
process.env.MESA_DEBUG = 'silent';
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
let mainWindow = null;
const MOCK_ITEMS = [{ item_code: 'TEST1', item_name: 'Test Item', description: 'Test Description', standard_rate: 10, current_stock: 100, barcode: '123' }];
const DEFAULT_CUSTOMER = { id: 1, name: 'Walk-in Customer', mobile: '0000000000' };
console.log('Registering IPC handlers...');
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
    await (0, database_1.initDatabase)();
    (0, auth_1.registerAuthHandlers)();
    (0, customers_1.registerCustomerHandlers)();
    (0, items_1.registerItemHandlers)();
    (0, sales_1.registerSalesHandlers)();
    (0, sync_1.registerSyncHandlers)();
    (0, pos_opening_1.registerPOSOpeningHandlers)();
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
electron_1.app.whenReady().then(async () => {
    electron_1.app.name = 'Chotu POS';
    console.log('App is ready, creating window...');
    await createWindow();
    electron_1.app.on('activate', async function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map
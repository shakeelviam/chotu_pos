"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserHandlers = registerUserHandlers;
const electron_1 = require("electron");
const users_1 = require("../services/users");
async function registerUserHandlers() {
    const userService = new users_1.UserService();
    await userService.initialize();
    electron_1.ipcMain.handle('users:create', async (_, params) => {
        try {
            const user = await userService.createUser(params);
            return { success: true, user };
        }
        catch (error) {
            console.error('Failed to create user:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('users:update', async (_, params) => {
        try {
            const user = await userService.updateUser(params.id, params.updates);
            return { success: true, user };
        }
        catch (error) {
            console.error('Failed to update user:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('users:change-password', async (_, params) => {
        try {
            await userService.changePassword(params.id, params.currentPassword, params.newPassword);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to change password:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('users:delete', async (_, id) => {
        try {
            await userService.deleteUser(id);
            return { success: true };
        }
        catch (error) {
            console.error('Failed to delete user:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('users:list', async () => {
        try {
            const users = await userService.getUsers();
            return { success: true, users };
        }
        catch (error) {
            console.error('Failed to list users:', error);
            return { success: false, error: error.message };
        }
    });
    return userService;
}
//# sourceMappingURL=users.js.map
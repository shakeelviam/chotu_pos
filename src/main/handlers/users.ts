import { ipcMain } from 'electron';
import { UserService } from '../services/users';

type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier';

interface CreateUserParams {
  username: string;
  password: string;
  role: UserRole;
}

interface UpdateUserParams {
  id: string;
  updates: any;
}

interface ChangePasswordParams {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export async function registerUserHandlers() {
  const userService = new UserService();
  // Initialize the user service
  await userService.initialize();

  ipcMain.handle('users:create', async (_, params: CreateUserParams) => {
    try {
      const user = await userService.createUser(params);
      return { success: true, user };
    } catch (error: any) {
      console.error('Failed to create user:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('users:update', async (_, params: UpdateUserParams) => {
    try {
      const user = await userService.updateUser(params.id, params.updates);
      return { success: true, user };
    } catch (error: any) {
      console.error('Failed to update user:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('users:change-password', async (_, params: ChangePasswordParams) => {
    try {
      await userService.changePassword(params.id, params.currentPassword, params.newPassword);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to change password:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('users:delete', async (_, id: string) => {
    try {
      await userService.deleteUser(id);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('users:list', async () => {
    try {
      const users = await userService.getUsers();
      return { success: true, users };
    } catch (error: any) {
      console.error('Failed to list users:', error);
      return { success: false, error: error.message };
    }
  });

  // This will be used by the auth handler
  return userService;
}

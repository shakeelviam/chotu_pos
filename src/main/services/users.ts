import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as bcrypt from 'bcrypt';
import { POSUser } from '@/types';

const USERS_FILE = path.join(app.getPath('userData'), 'users.json');
const SALT_ROUNDS = 10;

export class UserService {
  private users: POSUser[] = [];

  constructor() {}

  async initialize() {
    try {
      await this.loadUsers();
      
      // Create default super admin if no users exist
      if (this.users.length === 0) {
        await this.createUser({
          username: 'superadmin',
          password: 'superadmin123', // Should be changed on first login
          role: 'super_admin'
        });
      }
    } catch (error) {
      console.error('Failed to initialize user service:', error);
      throw error;
    }
  }

  private async loadUsers() {
    try {
      const exists = await fs.access(USERS_FILE).then(() => true).catch(() => false);
      if (!exists) {
        this.users = [];
        return;
      }

      const data = await fs.readFile(USERS_FILE, 'utf8');
      this.users = JSON.parse(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      throw error;
    }
  }

  private async saveUsers() {
    try {
      await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('Failed to save users:', error);
      throw error;
    }
  }

  async createUser({ username, password, role }: { 
    username: string; 
    password: string; 
    role: POSUser['role'];
  }) {
    try {
      // Check if username already exists
      if (this.users.some(u => u.username === username)) {
        throw new Error('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const newUser: POSUser = {
        id: Date.now().toString(),
        username,
        password: hashedPassword,
        role,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.users.push(newUser);
      await this.saveUsers();

      // Don't return the password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<Omit<POSUser, 'id' | 'password'>>) {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Don't allow updating certain fields
      const { id: _, password: __, ...safeUpdates } = updates as any;

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...safeUpdates,
        updated_at: new Date().toISOString()
      };

      await this.saveUsers();

      // Don't return the password
      const { password: ___, ...userWithoutPassword } = this.users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    try {
      const user = this.users.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.password = hashedPassword;
      user.updated_at = new Date().toISOString();

      await this.saveUsers();
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  async authenticateUser(username: string, password: string) {
    try {
      const user = this.users.find(u => u.username === username && u.active);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      throw error;
    }
  }

  async getUsers() {
    // Don't return passwords
    return this.users.map(({ password: _, ...user }) => user);
  }

  async deleteUser(id: string) {
    try {
      // Don't allow deleting the last super admin
      const user = this.users.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'super_admin') {
        const superAdmins = this.users.filter(u => u.role === 'super_admin' && u.active);
        if (superAdmins.length <= 1) {
          throw new Error('Cannot delete the last super admin');
        }
      }

      // Soft delete by setting active to false
      await this.updateUser(id, { active: false });
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs/promises");
const bcrypt = require("bcrypt");
const USERS_FILE = path.join(electron_1.app.getPath('userData'), 'users.json');
const SALT_ROUNDS = 10;
class UserService {
    constructor() {
        this.users = [];
    }
    async initialize() {
        try {
            await this.loadUsers();
            if (this.users.length === 0) {
                await this.createUser({
                    username: 'superadmin',
                    password: 'superadmin123',
                    role: 'super_admin'
                });
            }
        }
        catch (error) {
            console.error('Failed to initialize user service:', error);
            throw error;
        }
    }
    async loadUsers() {
        try {
            const exists = await fs.access(USERS_FILE).then(() => true).catch(() => false);
            if (!exists) {
                this.users = [];
                return;
            }
            const data = await fs.readFile(USERS_FILE, 'utf8');
            this.users = JSON.parse(data);
        }
        catch (error) {
            console.error('Failed to load users:', error);
            throw error;
        }
    }
    async saveUsers() {
        try {
            await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
        }
        catch (error) {
            console.error('Failed to save users:', error);
            throw error;
        }
    }
    async createUser({ username, password, role }) {
        try {
            if (this.users.some(u => u.username === username)) {
                throw new Error('Username already exists');
            }
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const newUser = {
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
            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        }
        catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }
    async updateUser(id, updates) {
        try {
            const userIndex = this.users.findIndex(u => u.id === id);
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            const { id: _, password: __, ...safeUpdates } = updates;
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...safeUpdates,
                updated_at: new Date().toISOString()
            };
            await this.saveUsers();
            const { password: ___, ...userWithoutPassword } = this.users[userIndex];
            return userWithoutPassword;
        }
        catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }
    async changePassword(id, currentPassword, newPassword) {
        try {
            const user = this.users.find(u => u.id === id);
            if (!user) {
                throw new Error('User not found');
            }
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }
            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            user.password = hashedPassword;
            user.updated_at = new Date().toISOString();
            await this.saveUsers();
            return true;
        }
        catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    }
    async authenticateUser(username, password) {
        try {
            const user = this.users.find(u => u.username === username && u.active);
            if (!user) {
                return null;
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return null;
            }
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            console.error('Failed to authenticate user:', error);
            throw error;
        }
    }
    async getUsers() {
        return this.users.map(({ password: _, ...user }) => user);
    }
    async deleteUser(id) {
        try {
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
            await this.updateUser(id, { active: false });
            return true;
        }
        catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=users.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.saveConfig = saveConfig;
exports.isConfigured = isConfigured;
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
const CONFIG_FILE = path.join(electron_1.app.getPath('userData'), 'config.json');
async function getConfig() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return {
                url: '',
                api_key: '',
                api_secret: ''
            };
        }
        const data = await fs.promises.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Failed to read config:', error);
        return {
            url: '',
            api_key: '',
            api_secret: ''
        };
    }
}
async function saveConfig(config) {
    try {
        await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
    catch (error) {
        console.error('Failed to save config:', error);
        throw error;
    }
}
async function isConfigured() {
    const config = await getConfig();
    return !!(config.url && config.api_key && config.api_secret);
}
//# sourceMappingURL=config.js.map
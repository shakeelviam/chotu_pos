"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
exports.getConfig = getConfig;
exports.saveConfig = saveConfig;
const electron_1 = require("electron");
const path = require("path");
const fs = require("fs");
class Config {
    constructor() {
        this.configPath = path.join(electron_1.app.getPath('userData'), 'config.json');
        this.config = {
            url: '',
            api_key: '',
            api_secret: '',
            useMockData: true,
            syncInterval: 30
        };
        this.loadConfig();
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                this.config = { ...this.config, ...JSON.parse(data) };
            }
        }
        catch (error) {
            console.error('Failed to load config:', error);
        }
    }
    async set(config) {
        try {
            this.config = { ...this.config, ...config };
            await fs.promises.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
        }
        catch (error) {
            console.error('Failed to save config:', error);
            throw error;
        }
    }
    get() {
        return { ...this.config };
    }
    isConfigured() {
        return !!(this.config.url && this.config.api_key && this.config.api_secret);
    }
    async clear() {
        try {
            if (fs.existsSync(this.configPath)) {
                await fs.promises.unlink(this.configPath);
            }
            this.config = {
                url: '',
                api_key: '',
                api_secret: '',
                useMockData: true,
                syncInterval: 30
            };
        }
        catch (error) {
            console.error('Failed to clear config:', error);
            throw error;
        }
    }
}
exports.Config = Config;
function getConfig() {
    return Config.getInstance().get();
}
function saveConfig(config) {
    return Config.getInstance().set(config);
}
//# sourceMappingURL=config.js.map
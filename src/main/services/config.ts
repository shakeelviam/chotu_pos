import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
  useMockData: boolean;
  syncInterval: number;
}

export class Config {
  private static instance: Config;
  private configPath: string;
  private config: ERPNextConfig;

  private constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.config = {
      url: '',
      api_key: '',
      api_secret: '',
      useMockData: true,
      syncInterval: 30
    };
    this.loadConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.config = { ...this.config, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  async set(config: Partial<ERPNextConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await fs.promises.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2)
      );
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  get(): ERPNextConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return !!(this.config.url && this.config.api_key && this.config.api_secret);
  }

  async clear(): Promise<void> {
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
    } catch (error) {
      console.error('Failed to clear config:', error);
      throw error;
    }
  }
}

// Export functions to maintain backward compatibility
export function getConfig(): ERPNextConfig {
  return Config.getInstance().get();
}

export function saveConfig(config: Partial<ERPNextConfig>): Promise<void> {
  return Config.getInstance().set(config);
}

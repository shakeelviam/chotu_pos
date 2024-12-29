import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
}

const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

export async function getConfig(): Promise<ERPNextConfig> {
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
  } catch (error) {
    console.error('Failed to read config:', error);
    return {
      url: '',
      api_key: '',
      api_secret: ''
    };
  }
}

export async function saveConfig(config: ERPNextConfig): Promise<void> {
  try {
    await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

export async function isConfigured(): Promise<boolean> {
  const config = await getConfig();
  return !!(config.url && config.api_key && config.api_secret);
}

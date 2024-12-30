import { contextBridge, ipcRenderer } from 'electron';
import { ERPNextConfig, RoleConfig, SystemConfig } from '@/types/admin';

export const adminBridge = {
  testConnection: () => ipcRenderer.invoke('admin:test-connection'),
  
  getERPNextConfig: () => ipcRenderer.invoke('admin:get-erpnext-config'),
  saveERPNextConfig: (config: ERPNextConfig) => ipcRenderer.invoke('admin:save-erpnext-config', config),
  
  getPOSProfiles: () => ipcRenderer.invoke('admin:get-pos-profiles'),
  
  getRoleConfigs: () => ipcRenderer.invoke('admin:get-role-configs'),
  saveRoleConfig: (config: RoleConfig) => ipcRenderer.invoke('admin:save-role-config', config),
  deleteRoleConfig: (role: string) => ipcRenderer.invoke('admin:delete-role-config', role),
  
  getSystemConfig: () => ipcRenderer.invoke('admin:get-system-config'),
  saveSystemConfig: (config: SystemConfig) => ipcRenderer.invoke('admin:save-system-config', config),
  
  getSystemLogs: (filters?: { level?: string }) => ipcRenderer.invoke('admin:get-system-logs', filters),
  clearSystemLogs: () => ipcRenderer.invoke('admin:clear-system-logs')
};

export function setupAdminBridge() {
  contextBridge.exposeInMainWorld('admin', adminBridge);
}

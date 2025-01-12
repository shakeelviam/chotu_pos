import { contextBridge, ipcRenderer } from 'electron';
import { setupAdminBridge } from './admin';

// Define the bridge for POS operations
const posBridge = {
  getCompanies: () => ipcRenderer.invoke('getCompanies'),
  getPaymentMethods: () => ipcRenderer.invoke('getPaymentMethods'),
  getPOSProfiles: (company: string) => ipcRenderer.invoke('getPOSProfiles', company),
  createPOSOpening: (data: any) => ipcRenderer.invoke('createPOSOpening', data),
  getCurrentPOSEntry: () => ipcRenderer.invoke('getCurrentPOSEntry'),
  closePOSEntry: (data: any) => ipcRenderer.invoke('closePOSEntry', data),
  syncPOSData: () => ipcRenderer.invoke('syncPOSData')
};

export function setupBridges() {
  setupAdminBridge();

  // Expose all bridges
  contextBridge.exposeInMainWorld('electron', {
    // Existing bridges
    ...posBridge
  });
}

setupBridges();
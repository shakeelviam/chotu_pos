import {
  POSOpeningEntry,
  POSBalanceDetail,
  Company,
  PaymentMethod,
  POSProfile
} from '@/types';

export interface POSBridgeAPI {
  getCompanies: () => Promise<{
    success: boolean;
    companies?: Company[];
    error?: string;
  }>;

  getPaymentMethods: () => Promise<{
    success: boolean;
    methods?: PaymentMethod[];
    error?: string;
  }>;

  getPOSProfiles: (company: string) => Promise<{
    success: boolean;
    profiles?: POSProfile[];
    error?: string;
  }>;

  createPOSOpening: (data: {
    company: string;
    posProfile: string;
    balanceDetails: POSBalanceDetail[];
  }) => Promise<{
    success: boolean;
    entry?: POSOpeningEntry;
    error?: string;
  }>;

  getCurrentPOSEntry: () => Promise<{
    success: boolean;
    entry?: POSOpeningEntry;
    error?: string;
  }>;

  closePOSEntry: (data: {
    id: string;
    closingDetails: POSBalanceDetail[];
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;

  syncPOSData: () => Promise<{
    success: boolean;
    error?: string;
  }>;

  calculateScalePrice: (data: {
    itemCode: string;
    weight: number;
  }) => Promise<{
    success: boolean;
    price?: number;
    weight?: number;
    uom?: string;
    error?: string;
  }>;
}

export type POSBridge = POSBridgeAPI;

// Augment the existing ElectronAPI interface
declare module 'electron' {
  interface ElectronAPI extends POSBridgeAPI {}
}

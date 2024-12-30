export interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
  useMockData: boolean;
  syncInterval: number;
}

export interface RoleConfig {
  role: string;
  posProfile: string;
  maxDiscountPercent: number;
  maxDiscountAmount: number;
}

export interface SystemConfig {
  offlineMode: {
    enabled: boolean;
    maxStorage: number;
    syncPriority: string[];
  };
  backup: {
    enabled: boolean;
    frequency: number;
    retentionDays: number;
  };
  debug: {
    enabled: boolean;
    logLevel: string;
  };
}

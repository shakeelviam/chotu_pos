import { mockItems, mockUser, mockSettings } from '../mock/mockData';
import { Item, Customer, Sale } from '@/shared/types';

interface POSOpeningData {
  posProfile: string;
  openingBalance: {
    cash: number;
    knet: number;
  };
}

interface POSClosingData {
  posProfile: string;
  closingBalance: {
    cash: number;
    knet: number;
  };
  closedAt: string;
}

interface Balance {
  cash: number;
  knet: number;
}

export class MockERPNextService {
  private currentBalance: Balance = {
    cash: 0,
    knet: 0
  };

  private sales: any[] = [];
  private syncedSales: any[] = [];

  async authenticate(username: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === mockUser.username && password === mockUser.password) {
      return {
        success: true,
        user: mockUser,
        settings: mockSettings
      };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  async getSettings() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      settings: mockSettings
    };
  }

  async createPOSOpening(data: POSOpeningData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.currentBalance = {
      cash: data.openingBalance.cash,
      knet: data.openingBalance.knet
    };

    return {
      success: true,
      message: 'POS opening entry created successfully'
    };
  }

  async createPOSClosing(data: POSClosingData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset balance after closing
    this.currentBalance = {
      cash: 0,
      knet: 0
    };

    return {
      success: true,
      message: 'POS closing entry created successfully'
    };
  }

  async getCurrentBalance(): Promise<Balance> {
    return this.currentBalance;
  }

  async checkSyncStatus(): Promise<{
    pendingItems: boolean;
    pendingCustomers: boolean;
    pendingSales: boolean;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const unsyncedSales = this.sales.filter(sale => !this.syncedSales.includes(sale));
    
    return {
      pendingItems: false,
      pendingCustomers: false,
      pendingSales: unsyncedSales.length > 0
    };
  }

  async syncInventory() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: mockItems
    };
  }

  async syncSales(sales: any[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (sales) {
      // Add new sales to the list
      this.sales.push(...sales);
    }
    
    // Mark all sales as synced
    this.syncedSales = [...this.sales];
    
    console.log("Syncing sales:", sales);
    return true;
  }

  async syncPayments() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: 'Payments synced successfully'
    };
  }

  async getItems(): Promise<{ items: Item[] }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { items: mockItems };
  }

  async getCustomers(): Promise<Customer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 1,
        name: 'Walk-in Customer',
        mobile: '0000000000'
      }
    ];
  }

  async createSale(saleData: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update balances based on payment method
    if (saleData.paymentMethod === 'cash') {
      this.currentBalance.cash += saleData.totalAmount;
    } else if (saleData.paymentMethod === 'knet') {
      this.currentBalance.knet += saleData.totalAmount;
    }

    this.sales.push(saleData);

    return {
      success: true,
      message: 'Sale created successfully'
    };
  }
}

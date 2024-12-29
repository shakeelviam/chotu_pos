import { ipcMain } from 'electron';

// Mock items for testing
const MOCK_ITEMS = [
  {
    item_code: "ITEM-001",
    item_name: "Test Item 1",
    description: "This is a test item",
    standard_rate: 10.000,
    current_stock: 100,
    barcode: "123456789"
  },
  {
    item_code: "ITEM-002",
    item_name: "Test Item 2",
    description: "This is another test item",
    standard_rate: 20.000,
    current_stock: 50,
    barcode: "987654321"
  },
  {
    item_code: "ITEM-003",
    item_name: "Test Item 3",
    description: "This is yet another test item",
    standard_rate: 30.000,
    current_stock: 75,
    barcode: "456789123"
  }
];

// Mock customers for testing
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "John Doe",
    mobile: "1234567890"
  },
  {
    id: 2,
    name: "Jane Smith",
    mobile: "0987654321"
  }
];

export function registerMockHandlers() {
  // Mock settings handler
  ipcMain.handle('auth:getSettings', async () => {
    try {
      return {
        success: true,
        settings: {
          currency: "KWD",
          currency_symbol: "KD",
          currency_precision: 3,
          currency_format: "#,###.###"
        }
      };
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      return { success: false, error: error.message || 'Failed to get settings' };
    }
  });

  // Mock items handlers
  ipcMain.handle('items:get', async () => {
    try {
      return { success: true, items: MOCK_ITEMS };
    } catch (error: any) {
      console.error('Failed to get items:', error);
      return { success: false, error: error.message || 'Failed to get items' };
    }
  });

  ipcMain.handle('items:search', async (_, query: string) => {
    try {
      const filteredItems = MOCK_ITEMS.filter(item => 
        item.item_name.toLowerCase().includes(query.toLowerCase()) ||
        item.item_code.toLowerCase().includes(query.toLowerCase()) ||
        item.barcode.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, items: filteredItems };
    } catch (error: any) {
      console.error('Failed to search items:', error);
      return { success: false, error: error.message || 'Failed to search items' };
    }
  });

  // Mock customer handlers
  ipcMain.handle('customers:search', async (_, query: string) => {
    try {
      const filteredCustomers = MOCK_CUSTOMERS.filter(customer => 
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.mobile.includes(query)
      );
      return { success: true, customers: filteredCustomers };
    } catch (error: any) {
      console.error('Failed to search customers:', error);
      return { success: false, error: error.message || 'Failed to search customers' };
    }
  });

  ipcMain.handle('customers:get-by-mobile', async (_, mobile: string) => {
    try {
      const customer = MOCK_CUSTOMERS.find(c => c.mobile === mobile);
      return { success: true, customer };
    } catch (error: any) {
      console.error('Failed to get customer:', error);
      return { success: false, error: error.message || 'Failed to get customer' };
    }
  });

  ipcMain.handle('customers:get-default', async () => {
    try {
      return { success: true, customer: MOCK_CUSTOMERS[0] };
    } catch (error: any) {
      console.error('Failed to get default customer:', error);
      return { success: false, error: error.message || 'Failed to get default customer' };
    }
  });

  // Mock POS session handlers
  ipcMain.handle('pos:getCurrentSession', async () => {
    try {
      return { 
        success: true, 
        session: {
          id: 1,
          status: 'open',
          opening_time: new Date().toISOString(),
          user: 'testuser'
        } 
      };
    } catch (error: any) {
      console.error('Failed to get current session:', error);
      return { success: false, error: error.message || 'Failed to get current session' };
    }
  });
}

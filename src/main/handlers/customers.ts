import { ipcMain } from 'electron';
import { Customer, CustomerResponse, CustomersResponse } from '@/shared/types';

// Mock customers data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Walk-in Customer',
    mobile: '0000000000'
  },
  {
    id: 2,
    name: 'John Doe',
    mobile: '1234567890'
  },
  {
    id: 3,
    name: 'Jane Smith',
    mobile: '0987654321'
  }
];

// Default customer is Walk-in Customer
const DEFAULT_CUSTOMER = MOCK_CUSTOMERS[0];

export function registerCustomerHandlers() {
  // Search customers
  ipcMain.handle('customers:search', async (_, query: string): Promise<CustomersResponse> => {
    try {
      const searchResults = MOCK_CUSTOMERS.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.mobile.includes(query)
      );
      return { success: true, customers: searchResults };
    } catch (error: any) {
      console.error('Failed to search customers:', error);
      return { success: false, error: error.message || 'Failed to search customers' };
    }
  });

  // Get customer by mobile
  ipcMain.handle('customers:get-by-mobile', async (_, mobile: string): Promise<CustomerResponse> => {
    try {
      const customer = MOCK_CUSTOMERS.find(c => c.mobile === mobile);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }
      return { success: true, customer };
    } catch (error: any) {
      console.error('Failed to get customer:', error);
      return { success: false, error: error.message || 'Failed to get customer' };
    }
  });

  // Get default customer
  ipcMain.handle('customers:get-default', async (): Promise<CustomerResponse> => {
    try {
      return { success: true, customer: DEFAULT_CUSTOMER };
    } catch (error: any) {
      console.error('Failed to get default customer:', error);
      return { success: false, error: error.message || 'Failed to get default customer' };
    }
  });

  // Create customer
  ipcMain.handle('customers:create', async (_, customerData: { name: string; mobile: string }): Promise<CustomerResponse> => {
    try {
      const newCustomer: Customer = {
        id: MOCK_CUSTOMERS.length + 1,
        ...customerData
      };
      MOCK_CUSTOMERS.push(newCustomer);
      return { success: true, customer: newCustomer };
    } catch (error: any) {
      console.error('Failed to create customer:', error);
      return { success: false, error: error.message || 'Failed to create customer' };
    }
  });

  // Update customer
  ipcMain.handle('customers:update', async (_, id: number, updates: Partial<Customer>): Promise<CustomerResponse> => {
    try {
      const customerIndex = MOCK_CUSTOMERS.findIndex(c => c.id === id);
      if (customerIndex === -1) {
        return { success: false, error: 'Customer not found' };
      }
      
      const updatedCustomer = {
        ...MOCK_CUSTOMERS[customerIndex],
        ...updates
      };
      MOCK_CUSTOMERS[customerIndex] = updatedCustomer;
      
      return { success: true, customer: updatedCustomer };
    } catch (error: any) {
      console.error('Failed to update customer:', error);
      return { success: false, error: error.message || 'Failed to update customer' };
    }
  });
}

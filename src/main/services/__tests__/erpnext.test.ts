import { ERPNextService } from '../erpnext';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ERPNextService', () => {
  const mockConfig = {
    url: 'https://test.erpnext.com',
    api_key: 'test_key',
    api_secret: 'test_secret',
    useMockData: false,
    syncInterval: 30
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return success when connection test passes', async () => {
      const service = new ERPNextService(mockConfig);
      mockedAxios.get.mockResolvedValueOnce({ data: { message: 'test_user' } });

      const result = await service.testConnection();

      expect(result).toEqual({ success: true });
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/method/frappe.auth.get_logged_user');
    });

    it('should return error when connection test fails', async () => {
      const service = new ERPNextService(mockConfig);
      const errorMessage = 'Connection failed';
      mockedAxios.get.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      const result = await service.testConnection();

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('authenticate', () => {
    const credentials = { username: 'test_user', password: 'test_pass' };

    it('should authenticate user successfully', async () => {
      const service = new ERPNextService(mockConfig);
      mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Logged In' } });
      mockedAxios.get
        .mockResolvedValueOnce({ data: { message: 'test_user' } })
        .mockResolvedValueOnce({ 
          data: { 
            data: { 
              roles: [{ role: 'System Manager' }] 
            } 
          } 
        });

      const result = await service.authenticate(credentials.username, credentials.password);

      expect(result).toEqual({
        success: true,
        user: {
          username: 'test_user',
          role: 'admin',
          erpnextUser: true
        }
      });
    });

    it('should handle authentication failure', async () => {
      const service = new ERPNextService(mockConfig);
      const errorMessage = 'Invalid credentials';
      mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

      const result = await service.authenticate(credentials.username, credentials.password);

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('syncAll', () => {
    it('should sync all data successfully', async () => {
      const service = new ERPNextService(mockConfig);
      mockedAxios.get.mockResolvedValueOnce({ data: { data: { name: 'test_profile' } } }) // getPOSProfile
        .mockResolvedValueOnce({ data: { message: [] } }) // syncItems
        .mockResolvedValueOnce({ data: { message: [] } }) // syncCustomers
        .mockResolvedValueOnce({ data: { message: [] } }) // syncPaymentMethods
        .mockResolvedValueOnce({ data: { message: [] } }) // syncTaxTemplates
        .mockResolvedValueOnce({ data: { message: [] } }); // syncPriceLists

      const result = await service.syncAll();

      expect(result).toEqual({ success: true });
      expect(mockedAxios.get).toHaveBeenCalledTimes(6);
    });

    it('should handle sync failure', async () => {
      const service = new ERPNextService(mockConfig);
      const errorMessage = 'Sync failed';
      mockedAxios.get.mockRejectedValueOnce({ message: errorMessage });

      const result = await service.syncAll();

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });
});

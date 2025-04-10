import { login, URLs, request } from '../lib/allauth'; // Path to the file
import { getCSRFToken } from '../lib/django'; // Mocking getCSRFToken

// Mock the global fetch function and getCSRFToken
global.fetch = jest.fn();
jest.mock('../lib/django', () => ({
  getCSRFToken: jest.fn(),
}));

describe('Auth API functions', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should call the login API with the correct parameters and return the response', async () => {
    const mockData = { username: 'testuser', password: 'testpassword' };
    const mockResponse = { status: 200, message: 'Login successful' };
    
    // Mock the implementation of fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    // Mock getCSRFToken to return a mock token
    (getCSRFToken as jest.Mock).mockReturnValue('mock-csrf-token');

    // Call the login function
    const result = await login(mockData);

    // Check if fetch was called with the correct URL and options
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(URLs.LOGIN),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockData),
        headers: expect.objectContaining({
          accept: 'application/json',
          'X-CSRFToken': 'mock-csrf-token',
        }),
      })
    );

    // Check the response
    expect(result).toEqual(mockResponse);
  });

  it('should handle failed login attempt', async () => {
    const mockData = { username: 'testuser', password: 'wrongpassword' };
    const mockResponse = { status: 401, message: 'Unauthorized' };

    // Mock the implementation of fetch for a failed login
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    // Mock getCSRFToken to return a mock token
    (getCSRFToken as jest.Mock).mockReturnValue('mock-csrf-token');

    const result = await login(mockData);

    // Check the response for failed login
    expect(result).toEqual(mockResponse);
  });
});

describe('request function', () => {
  it('should make a GET request and return the response', async () => {
    const mockResponse = { status: 200, message: 'Request successful' };

    // Mock fetch for a GET request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await request('GET', URLs.SESSION);

    // Check if fetch was called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(URLs.SESSION),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          accept: 'application/json',
        }),
      })
    );

    // Check the response
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if the response status is not 200', async () => {
    const mockResponse = { status: 400, message: 'Bad Request' };

    // Mock fetch for a failed request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await request('GET', URLs.SESSION);

    expect(result).toEqual(mockResponse);
  });
});
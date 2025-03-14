import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define API response type
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Define API error type
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;
  private baseURL: string;

  private constructor() {
    // Get the API URL from environment variables or use a default
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    // Create Axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000, // 15 seconds
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequest(config),
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  // Get singleton instance
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Handle request - add auth token if available
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }

  // Handle API errors
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
    };

    // Handle specific error responses from the API
    if (error.response) {
      const { data, status } = error.response;
      
      apiError.status = status;
      
      if (data) {
        if (typeof data === 'string') {
          apiError.message = data;
        } else if (typeof data === 'object' && data !== null) {
          // Safely access properties
          const responseData = data as Record<string, any>;
          
          if (responseData.message) {
            apiError.message = responseData.message as string;
          }
          
          if (responseData.errors) {
            apiError.errors = responseData.errors as Record<string, string[]>;
          }
        }
      }

      // Handle authentication errors
      if (status === 401) {
        // Clear token if unauthorized
        localStorage.removeItem('auth_token');
        
        // Dispatch event for auth store to handle
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'No response received from server';
    } else {
      // Something happened in setting up the request
      apiError.message = error.message;
    }

    return Promise.reject(apiError);
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET request
  public async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  // POST request
  public async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  // PUT request
  public async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  // PATCH request
  public async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  // DELETE request
  public async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export default for convenience
export default apiClient; 
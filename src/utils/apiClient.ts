import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '@types/index';
import { API_CONFIG, AUTH_CONFIG } from '@/config/constants';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
    });

    // Request interceptor: Add user email header
    this.instance.interceptors.request.use(
      (config) => {
        const userStr = localStorage.getItem(AUTH_CONFIG.storageKey);
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            config.headers[AUTH_CONFIG.headerKey] = user.email;
          } catch {
            console.warn('Failed to parse user from localStorage');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle specific error codes
        if (error.response?.status === 401) {
          // Unauthorized - clear auth
          localStorage.removeItem(AUTH_CONFIG.storageKey);
          window.location.href = AUTH_CONFIG.redirectTo.login;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   */
  async get<T = any>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config = {}): Promise<T> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(url: string, data?: any, config = {}): Promise<T> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(url: string, config = {}): Promise<T> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config);
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * WebSocket connection helper (for real-time streams)
   */
  connectWs(url: string): WebSocket {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${new URL(API_CONFIG.baseURL).host}${url}`;
    return new WebSocket(wsUrl);
  }

  /**
   * Error handler utility
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || 0,
        data: error.response?.data,
      };
    }
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }

  /**
   * Get raw axios instance for advanced use cases
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type for use in components
export default apiClient;

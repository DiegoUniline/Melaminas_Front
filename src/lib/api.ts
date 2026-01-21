// API Service para El Melaminas
const API_URL = 'https://melaminas-api-e8fb1fd98f5d.herokuapp.com/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Error al procesar la respuesta del servidor'
    };
  }
}

export const api = {
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API GET Error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API POST Error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  async put<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  },

  async del<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE'
      });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }
};

export default api;

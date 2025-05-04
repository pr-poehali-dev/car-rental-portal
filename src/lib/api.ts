
/**
 * API-сервис для работы с бэкендом
 */
import { toast } from "@/hooks/use-toast";

// Базовый URL для API запросов
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.avtoprokat-demo.ru/api/v1';

// Типы данных
export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  year: number;
  seats: number;
  transmission: string;
  fuel: string;
  category: string;
  available: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  carId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  carDetails?: {
    title: string;
    category: string;
    image: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  avatar?: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

// Параметры для фильтрации автомобилей
export interface CarFilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
  fuel?: string;
  available?: boolean;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc';
}

// Параметры для фильтрации бронирований
export interface BookingFilterParams {
  status?: Booking['status'];
  paymentStatus?: Booking['paymentStatus'];
  startDate?: string;
  endDate?: string;
  userId?: string;
  carId?: string;
}

// Класс для работы с API
class ApiService {
  private token: string | null = null;
  private abortControllers: Map<string, AbortController> = new Map();

  // Инициализация токена из localStorage при создании экземпляра
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Установка токена авторизации
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Очистка токена авторизации
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Отмена текущего запроса
  cancelRequest(requestId: string) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  // Общий метод для выполнения запросов
  async request<T>(url: string, options: RequestInit = {}, requestId?: string): Promise<T> {
    // Создаем контроллер для отмены запроса
    if (requestId) {
      // Отменяем предыдущий запрос с таким же ID, если он существует
      this.cancelRequest(requestId);
      
      const controller = new AbortController();
      options.signal = controller.signal;
      this.abortControllers.set(requestId, controller);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Добавляем токен авторизации, если он есть
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      // Если запрос был отменен, удаляем контроллер
      if (requestId) {
        this.abortControllers.delete(requestId);
      }

      // Обработка ошибок
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Ошибка сервера: ${response.status}`;
        
        const error = new Error(errorMessage) as ApiError;
        error.status = response.status;
        error.data = errorData;
        
        if (response.status === 401) {
          this.clearToken();
          // Перенаправление на страницу входа, если это клиентский код
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
        
        throw error;
      }

      // Для запросов DELETE, которые могут не возвращать данные
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      // Не логируем ошибки отмены запроса
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      // Логируем остальные ошибки
      console.error('API error:', error);
      
      // Отображаем toast только для неотмененных запросов
      if (!(error instanceof Error && error.name === 'AbortError')) {
        toast({
          title: "Ошибка API",
          description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }

  // Объединение параметров в строку запроса
  private buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    return query ? `?${query}` : '';
  }

  // Методы для работы с автомобилями
  async getCars(filters?: CarFilterParams): Promise<Car[]> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.request<Car[]>(`/cars${queryString}`, {}, 'get-cars');
  }

  async searchCars(query: string): Promise<Car[]> {
    return this.request<Car[]>(`/cars/search?q=${encodeURIComponent(query)}`, {}, 'search-cars');
  }

  async getCar(id: string): Promise<Car> {
    return this.request<Car>(`/cars/${id}`);
  }

  async createCar(car: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car> {
    return this.request<Car>('/cars', {
      method: 'POST',
      body: JSON.stringify(car),
    });
  }

  async updateCar(id: string, car: Partial<Car>): Promise<Car> {
    return this.request<Car>(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(car),
    });
  }

  async deleteCar(id: string): Promise<void> {
    return this.request<void>(`/cars/${id}`, {
      method: 'DELETE',
    });
  }

  async checkCarAvailability(carId: string, startDate: string, endDate: string): Promise<{available: boolean; conflictDates?: string[]}> {
    return this.request<{available: boolean; conflictDates?: string[]}>(`/cars/${carId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  // Методы для работы с бронированиями
  async getBookings(filters?: BookingFilterParams): Promise<Booking[]> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.request<Booking[]>(`/bookings${queryString}`, {}, 'get-bookings');
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.request<Booking[]>(`/bookings/user/${userId}`);
  }

  async getBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateBookingPaymentStatus(id: string, paymentStatus: Booking['paymentStatus']): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request<void>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Методы для работы с пользователями и авторизацией
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(result.token);
    return result;
  }

  async register(userData: { name: string; email: string; password: string; phone: string }): Promise<{ token: string; user: User }> {
    const result = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(result.token);
    return result;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async logout(): Promise<void> {
    // В реальном приложении здесь был бы запрос на сервер для инвалидации токена
    this.clearToken();
  }

  // Методы для статистики (админ-панель)
  async getDashboardStats(): Promise<{
    carsCount: number;
    bookingsCount: number;
    usersCount: number;
    revenue: number;
    recentBookings: Booking[];
    popularCars: (Car & { bookingsCount: number })[];
  }> {
    return this.request<any>('/stats/dashboard');
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const api = new ApiService();

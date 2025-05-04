
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// Класс для работы с API
class ApiService {
  private token: string | null = null;

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

  // Общий метод для выполнения запросов
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
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

      // Обработка ошибок
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Ошибка сервера: ${response.status}`;
        
        if (response.status === 401) {
          this.clearToken();
        }
        
        throw new Error(errorMessage);
      }

      // Для запросов DELETE, которые могут не возвращать данные
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      toast({
        title: "Ошибка API",
        description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка',
        variant: "destructive",
      });
      throw error;
    }
  }

  // Методы для работы с автомобилями
  async getCars(): Promise<Car[]> {
    return this.request<Car[]>('/cars');
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

  // Методы для работы с бронированиями
  async getBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings');
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

  async logout(): Promise<void> {
    this.clearToken();
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const api = new ApiService();

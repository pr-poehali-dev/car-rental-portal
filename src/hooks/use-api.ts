
import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Хук для управления состоянием загрузки API запросов
 */
export function useApiAction<T, P extends any[]>(
  apiMethod: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiMethod(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
        setError(error);
        toast({
          title: "Ошибка операции",
          description: error.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiMethod, toast]
  );

  return { execute, data, isLoading, error };
}

/**
 * Хук для работы с автомобилями
 */
export function useCars() {
  const { execute: fetchCars, data: cars, isLoading, error } = useApiAction(api.getCars.bind(api));
  const { execute: createCar } = useApiAction(api.createCar.bind(api));
  const { execute: updateCar } = useApiAction(api.updateCar.bind(api));
  const { execute: deleteCar } = useApiAction(api.deleteCar.bind(api));
  
  return {
    cars,
    isLoading,
    error,
    fetchCars,
    createCar,
    updateCar,
    deleteCar
  };
}

/**
 * Хук для работы с бронированиями
 */
export function useBookings() {
  const { execute: fetchBookings, data: bookings, isLoading, error } = useApiAction(api.getBookings.bind(api));
  const { execute: createBooking } = useApiAction(api.createBooking.bind(api));
  const { execute: updateBookingStatus } = useApiAction(api.updateBookingStatus.bind(api));
  
  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus
  };
}

/**
 * Хук для проверки доступности автомобиля на выбранные даты
 */
export function useCheckAvailability() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  // В реальном приложении здесь будет запрос к API
  const checkAvailability = useCallback(async (carId: string, startDate: Date, endDate: Date) => {
    setIsChecking(true);
    setIsAvailable(null);
    
    try {
      // Mock API call - в реальном приложении здесь был бы запрос к серверу
      // const result = await api.checkAvailability(carId, startDate, endDate);
      
      // Эмуляция запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Случайный результат для демонстрации
      const result = Math.random() > 0.3;
      
      setIsAvailable(result);
      return result;
    } catch (error) {
      toast({
        title: "Ошибка проверки доступности",
        description: "Не удалось проверить доступность автомобиля на выбранные даты",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  return { checkAvailability, isChecking, isAvailable };
}

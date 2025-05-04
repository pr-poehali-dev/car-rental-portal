
import { useState, useEffect } from "react";
import { Car, CalendarClock, Users, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Booking, Car as CarType } from "@/lib/api";

const AdminDashboard = () => {
  const [carsCount, setCarsCount] = useState<number>(0);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Получаем данные с API
        const [carsData, bookingsData] = await Promise.all([
          api.getCars(),
          api.getBookings()
        ]);
        
        // Обрабатываем полученные данные
        setCarsCount(carsData.length);
        setBookingsCount(bookingsData.length);
        
        // Подсчитываем активные бронирования (подтвержденные, но не завершенные)
        const activeBookings = bookingsData.filter(booking => 
          booking.status === 'confirmed'
        );
        setActiveBookingsCount(activeBookings.length);
        
        // Подсчитываем общую выручку (все подтвержденные или завершенные бронирования)
        const revenue = bookingsData
          .filter(booking => ['confirmed', 'completed'].includes(booking.status))
          .reduce((sum, booking) => sum + booking.totalPrice, 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Ошибка при загрузке данных для панели:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Всего автомобилей</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {loading ? '...' : carsCount}
              <Car className="h-5 w-5 text-primary/80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Всего автомобилей в каталоге
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Всего бронирований</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {loading ? '...' : bookingsCount}
              <CalendarClock className="h-5 w-5 text-primary/80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Общее количество бронирований за все время
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Активные бронирования</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {loading ? '...' : activeBookingsCount}
              <Users className="h-5 w-5 text-primary/80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Подтвержденные, но не завершенные бронирования
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Общая выручка</CardDescription>
            <CardTitle className="text-2xl flex items-center justify-between">
              {loading ? '...' : `${totalRevenue.toLocaleString('ru-RU')} ₽`}
              <DollarSign className="h-5 w-5 text-primary/80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Сумма по всем подтвержденным и завершенным бронированиям
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Статистика бронирований
            </CardTitle>
            <CardDescription>
              Обзор активности на платформе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              График бронирований будет добавлен в следующем обновлении
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Последние действия</CardTitle>
            <CardDescription>
              Недавние бронирования и изменения
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-3 py-1">
                  <p className="text-sm">Новое бронирование - Toyota Camry</p>
                  <p className="text-xs text-muted-foreground">1 час назад</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="text-sm">Обновлен статус бронирования #12345</p>
                  <p className="text-xs text-muted-foreground">3 часа назад</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3 py-1">
                  <p className="text-sm">Добавлен новый автомобиль - BMW X5</p>
                  <p className="text-xs text-muted-foreground">5 часов назад</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

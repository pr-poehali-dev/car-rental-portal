
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, LoaderCircle, Eye, CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api, Booking, Car } from "@/lib/api";
import { cn } from "@/lib/utils";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Booking['status'] | "">("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка бронирований при монтировании
  useEffect(() => {
    fetchBookingsAndCars();
  }, []);

  // Получение бронирований и автомобилей с API
  const fetchBookingsAndCars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [bookingsResponse, carsResponse] = await Promise.all([
        api.getBookings(),
        api.getCars()
      ]);
      
      setBookings(bookingsResponse);
      setCars(carsResponse);
    } catch (err) {
      setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обновление статуса бронирования
  const handleUpdateStatus = async (id: string, status: Booking['status']) => {
    setOperationLoading(true);
    
    try {
      await api.updateBookingStatus(id, status);
      
      // Обновляем локальное состояние
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status } : booking
      ));
      
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    } catch (err) {
      console.error("Ошибка при обновлении статуса:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Получение автомобиля по ID
  const getCarById = (carId: string) => {
    return cars.find(car => car.id === carId);
  };

  // Отображение статуса бронирования
  const renderStatus = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Ожидает подтверждения</Badge>;
      case 'confirmed':
        return <Badge variant="success">Подтверждено</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>;
      case 'completed':
        return <Badge variant="default">Завершено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Отображение статуса оплаты
  const renderPaymentStatus = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Ожидает оплаты</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Оплачено</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Возврат средств</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Фильтрация бронирований
  const filteredBookings = bookings.filter(booking => 
    statusFilter ? booking.status === statusFilter : true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управление бронированиями</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Фильтры
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium">Статус бронирования</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все статусы</SelectItem>
                    <SelectItem value="pending">Ожидает подтверждения</SelectItem>
                    <SelectItem value="confirmed">Подтверждено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Бронирования</CardTitle>
          <CardDescription>
            Общее количество: {bookings.length} | Отфильтровано: {filteredBookings.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-destructive p-4">{error}</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Даты аренды</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Оплата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                      const car = getCarById(booking.carId);
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{car?.title || "Неизвестный автомобиль"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                              <span>
                                {format(new Date(booking.startDate), "dd.MM.yyyy", { locale: ru })} 
                                {" - "}
                                {format(new Date(booking.endDate), "dd.MM.yyyy", { locale: ru })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{booking.totalPrice} ₽</TableCell>
                          <TableCell>{renderStatus(booking.status)}</TableCell>
                          <TableCell>{renderPaymentStatus(booking.paymentStatus)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Drawer>
                                <DrawerTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                  <div className="mx-auto w-full max-w-lg">
                                    <DrawerHeader>
                                      <DrawerTitle>Детали бронирования</DrawerTitle>
                                      <DrawerDescription>ID: {booking.id}</DrawerDescription>
                                    </DrawerHeader>
                                    
                                    <div className="p-4 space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Автомобиль</h4>
                                          <p>{car?.title || "Неизвестный автомобиль"}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Категория</h4>
                                          <p>{car?.category || "Неизвестно"}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Дата начала</h4>
                                          <p>{format(new Date(booking.startDate), "PPP", { locale: ru })}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Дата окончания</h4>
                                          <p>{format(new Date(booking.endDate), "PPP", { locale: ru })}</p>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Статус бронирования</h4>
                                          <div className="mt-1">{renderStatus(booking.status)}</div>
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500 mb-1">Статус оплаты</h4>
                                          <div className="mt-1">{renderPaymentStatus(booking.paymentStatus)}</div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">Итоговая сумма</h4>
                                        <p className="text-xl font-bold text-primary">{booking.totalPrice} ₽</p>
                                      </div>
                                      
                                      <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium mb-2">Действия</h4>
                                        <div className="flex gap-2">
                                          {booking.status === 'pending' && (
                                            <>
                                              <Button 
                                                variant="outline" 
                                                className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                disabled={operationLoading}
                                              >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Подтвердить
                                              </Button>
                                              
                                              <Button 
                                                variant="outline" 
                                                className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                disabled={operationLoading}
                                              >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Отменить
                                              </Button>
                                            </>
                                          )}
                                          
                                          {booking.status === 'confirmed' && (
                                            <Button 
                                              variant="outline" 
                                              className="flex-1"
                                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                              disabled={operationLoading}
                                            >
                                              Завершить бронирование
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <DrawerFooter>
                                      <DrawerClose>
                                        <Button variant="outline" className="w-full">Закрыть</Button>
                                      </DrawerClose>
                                    </DrawerFooter>
                                  </div>
                                </DrawerContent>
                              </Drawer>
                              
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Статус
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="grid gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className={cn(
                                        "justify-start",
                                        booking.status === 'confirmed' && "bg-primary/10 text-primary"
                                      )}
                                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                      disabled={booking.status === 'confirmed' || operationLoading}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Подтвердить
                                    </Button>
                                    
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className={cn(
                                        "justify-start",
                                        booking.status === 'cancelled' && "bg-destructive/10 text-destructive"
                                      )}
                                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                      disabled={booking.status === 'cancelled' || operationLoading}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Отменить
                                    </Button>
                                    
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className={cn(
                                        "justify-start",
                                        booking.status === 'completed' && "bg-primary/10 text-primary"
                                      )}
                                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                      disabled={booking.status === 'completed' || operationLoading}
                                    >
                                      Завершить
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        {statusFilter ? "Бронирования с выбранным статусом не найдены" : "Нет бронирований"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;

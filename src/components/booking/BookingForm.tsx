
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Car, LoaderCircle, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api, Car as CarType } from "@/lib/api";
import { cn } from "@/lib/utils";

// Схема валидации для формы бронирования
const bookingSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(10, "Телефон должен содержать минимум 10 цифр"),
  startDate: z.date({
    required_error: "Выберите дату начала аренды",
  }),
  endDate: z.date({
    required_error: "Выберите дату окончания аренды",
  }),
  agreed: z.boolean().refine((val) => val === true, {
    message: "Вы должны согласиться с условиями",
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  car: CarType;
  onSuccess?: () => void;
}

const BookingForm = ({ car, onSuccess }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [totalDays, setTotalDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(car.price);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean;
    conflictDates?: string[];
  }>({
    checking: false,
    available: true,
  });
  const navigate = useNavigate();

  // Создаем форму с валидацией
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      agreed: false,
    },
  });

  // Расчет общей стоимости при изменении дат
  useEffect(() => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate) {
      const days = Math.max(1, differenceInDays(endDate, startDate));
      setTotalDays(days);
      setTotalPrice(days * car.price);
    }
  }, [form.watch("startDate"), form.watch("endDate"), car.price]);

  // Проверка доступности автомобиля на выбранные даты
  const checkAvailability = async () => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (!startDate || !endDate) return;
    
    setAvailabilityStatus({
      checking: true,
      available: true,
    });
    
    try {
      const result = await api.checkCarAvailability(
        car.id,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd")
      );
      
      setAvailabilityStatus({
        checking: false,
        available: result.available,
        conflictDates: result.conflictDates,
      });
    } catch (error) {
      console.error("Ошибка при проверке доступности:", error);
      setAvailabilityStatus({
        checking: false,
        available: false,
      });
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      checkAvailability();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [form.watch("startDate"), form.watch("endDate")]);

  // Отправка формы
  const onSubmit = async (data: BookingFormValues) => {
    if (!availabilityStatus.available) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Создаем объект бронирования
      const booking = {
        carId: car.id,
        userId: "guest", // В реальном приложении здесь был бы ID пользователя или guest
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        totalPrice: totalPrice,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        userDetails: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      };
      
      // Отправляем данные на сервер
      const result = await api.createBooking(booking);
      
      setBookingSuccess(true);
      
      // Вызываем колбэк успешного бронирования, если он передан
      if (onSuccess) {
        onSuccess();
      }
      
      // В реальном приложении здесь был бы редирект на страницу оплаты
      // navigate(`/payment/${result.id}`);
      
      // Для демо просто показываем сообщение об успешном бронировании
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-xl text-primary">Забронировать автомобиль</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4" />
            <span>{car.title}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      {bookingSuccess ? (
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Бронирование успешно отправлено</h3>
            <p className="text-muted-foreground">
              Мы получили ваш запрос на бронирование автомобиля {car.title}.
              Скоро с вами свяжется наш менеджер для подтверждения.
            </p>
            <div className="pt-4">
              <Button onClick={() => navigate("/")} className="mr-2">
                На главную
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Новое бронирование
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 pt-6">
              {/* Блок с датами аренды */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата начала аренды</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ru })
                              ) : (
                                <span>Выберите дату</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата окончания аренды</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ru })
                              ) : (
                                <span>Выберите дату</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return date < startDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Проверка доступности */}
              {availabilityStatus.checking ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Проверка доступности...
                </div>
              ) : !availabilityStatus.available ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Автомобиль недоступен</AlertTitle>
                  <AlertDescription>
                    К сожалению, автомобиль уже забронирован на выбранные даты.
                    Пожалуйста, выберите другие даты.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              {/* Сводка по бронированию */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="font-medium mb-2">Сводка бронирования</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Стоимость в день:</span>
                    <span>{car.price} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Количество дней:</span>
                    <span>{totalDays}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Итого:</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                </div>
              </div>
              
              {/* Данные пользователя */}
              <div className="space-y-4">
                <div className="font-medium">Ваши данные</div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя и фамилия</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Иванов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+7 (999) 123-45-67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="agreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Я согласен с условиями аренды и правилами обработки персональных данных
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !availabilityStatus.available}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Оформить бронирование
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                После оформления бронирования вы получите подтверждение на указанный email.
                Оплата производится при получении автомобиля.
              </p>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
};

export default BookingForm;

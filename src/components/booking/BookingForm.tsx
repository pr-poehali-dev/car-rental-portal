
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCheckAvailability } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  carId: string;
  carTitle: string;
  pricePerDay: number;
  onBookingComplete?: () => void;
}

const BookingForm = ({ carId, carTitle, pricePerDay, onBookingComplete }: BookingFormProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [bookingStep, setBookingStep] = useState<'dates' | 'confirm' | 'success'>('dates');
  
  const { checkAvailability, isChecking, isAvailable } = useCheckAvailability();
  
  // Расчет длительности аренды в днях
  const getDuration = () => {
    if (!startDate || !endDate) return 0;
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Минимум 1 день
  };
  
  // Расчет итоговой стоимости
  const getTotalPrice = () => {
    return getDuration() * pricePerDay;
  };

  // Функция для проверки доступности и перехода к подтверждению
  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) return;
    
    const available = await checkAvailability(carId, startDate, endDate);
    
    if (available) {
      setBookingStep('confirm');
    }
  };
  
  // Функция для оформления бронирования (здесь будет интеграция с API)
  const handleConfirmBooking = async () => {
    // В реальном приложении здесь будет запрос к API
    // await api.createBooking({...})
    
    // Эмуляция запроса
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBookingStep('success');
    
    if (onBookingComplete) {
      onBookingComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Бронирование</CardTitle>
        <CardDescription>
          {bookingStep === 'dates' && "Выберите даты аренды автомобиля"}
          {bookingStep === 'confirm' && "Подтверждение бронирования"}
          {bookingStep === 'success' && "Автомобиль успешно забронирован"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {bookingStep === 'dates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата начала</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP", { locale: ru })
                      ) : (
                        "Выберите дату"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Дата окончания</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={!startDate}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP", { locale: ru })
                      ) : (
                        "Выберите дату"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => 
                        !startDate || date < startDate || date < new Date()
                      }
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span>Длительность аренды:</span>
                  <span className="font-medium">{getDuration()} дн.</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Стоимость в день:</span>
                  <span className="font-medium">{pricePerDay} ₽</span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Итого:</span>
                  <span className="text-primary">{getTotalPrice()} ₽</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {bookingStep === 'confirm' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="text-lg font-medium">{carTitle}</div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">Дата начала:</div>
                <div>{startDate && format(startDate, "PPP", { locale: ru })}</div>
                
                <div className="text-gray-500">Дата окончания:</div>
                <div>{endDate && format(endDate, "PPP", { locale: ru })}</div>
                
                <div className="text-gray-500">Длительность:</div>
                <div>{getDuration()} дн.</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Стоимость аренды:</span>
                <span>{pricePerDay} ₽ × {getDuration()} дн.</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span>Страховка:</span>
                <span>Включена</span>
              </div>
              
              <div className="border-t my-2 pt-2"></div>
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Итого к оплате:</span>
                <span className="text-primary">{getTotalPrice()} ₽</span>
              </div>
            </div>
          </div>
        )}
        
        {bookingStep === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Успешное бронирование!</h3>
            <p className="text-gray-500 mb-4">
              Вы успешно забронировали автомобиль {carTitle} с {startDate && format(startDate, "PPP", { locale: ru })} по {endDate && format(endDate, "PPP", { locale: ru })}.
            </p>
            <p className="text-sm text-gray-500">
              Подтверждение бронирования отправлено на вашу электронную почту.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {bookingStep === 'dates' && (
          <Button 
            onClick={handleCheckAvailability}
            disabled={!startDate || !endDate || isChecking}
            className="w-full"
          >
            {isChecking ? 'Проверка...' : 'Проверить доступность'}
          </Button>
        )}
        
        {bookingStep === 'confirm' && (
          <>
            <Button 
              variant="outline" 
              onClick={() => setBookingStep('dates')}
            >
              Назад
            </Button>
            <Button 
              onClick={handleConfirmBooking}
            >
              Подтвердить бронирование
            </Button>
          </>
        )}
        
        {bookingStep === 'success' && (
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Вернуться на главную
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingForm;

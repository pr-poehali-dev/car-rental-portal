
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Pencil, Trash2, LoaderCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { api, Car } from "@/lib/api";

const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Car>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [openCarDialog, setOpenCarDialog] = useState(false);
  const [currentCar, setCurrentCar] = useState<Partial<Car> | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  const navigate = useNavigate();

  // Загрузка автомобилей при монтировании
  useEffect(() => {
    fetchCars();
  }, []);

  // Загрузка автомобилей с API
  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getCars();
      setCars(response);
    } catch (err) {
      setError("Ошибка при загрузке автомобилей. Пожалуйста, попробуйте позже.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Открытие диалога для создания или редактирования
  const handleOpenCarDialog = (car?: Car) => {
    if (car) {
      setCurrentCar({ ...car });
    } else {
      setCurrentCar({
        title: "",
        description: "",
        price: 0,
        image: "",
        images: [],
        year: new Date().getFullYear(),
        seats: 5,
        transmission: "Автомат",
        fuel: "Бензин",
        category: "Эконом",
        available: true,
        features: []
      });
    }
    setOpenCarDialog(true);
  };

  // Сохранение автомобиля (создание или обновление)
  const handleSaveCar = async () => {
    if (!currentCar) return;
    
    setOperationLoading(true);
    
    try {
      if (currentCar.id) {
        // Обновление существующего автомобиля
        await api.updateCar(currentCar.id, currentCar);
      } else {
        // Создание нового автомобиля
        await api.createCar(currentCar as Omit<Car, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await fetchCars(); // Перезагружаем список
      setOpenCarDialog(false);
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Удаление автомобиля
  const handleDeleteCar = async (id: string) => {
    setOperationLoading(true);
    
    try {
      await api.deleteCar(id);
      await fetchCars(); // Перезагружаем список
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    } finally {
      setOperationLoading(false);
    }
  };

  // Обработчики изменения полей автомобиля
  const handleCarFieldChange = (field: keyof Car, value: any) => {
    if (!currentCar) return;
    
    setCurrentCar({
      ...currentCar,
      [field]: value
    });
  };

  // Изменение направления сортировки
  const handleSort = (field: keyof Car) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Сортировка и фильтрация автомобилей
  const filteredAndSortedCars = cars
    .filter(car => 
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Сортировка строк
      if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        return sortDirection === "asc" 
          ? (a[sortField] as string).localeCompare(b[sortField] as string) 
          : (b[sortField] as string).localeCompare(a[sortField] as string);
      }
      
      // Сортировка чисел
      if (typeof a[sortField] === 'number' && typeof b[sortField] === 'number') {
        return sortDirection === "asc" 
          ? (a[sortField] as number) - (b[sortField] as number) 
          : (b[sortField] as number) - (a[sortField] as number);
      }
      
      return 0;
    });

  // Функция рендеринга сортировочной иконки
  const renderSortIcon = (field: keyof Car) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Управление автомобилями</h1>
        <Button onClick={() => handleOpenCarDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить автомобиль
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Автомобили</CardTitle>
          <CardDescription>
            Общее количество: {cars.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Поиск по названию или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort("title")}>
                      <div className="flex items-center">
                        Название {renderSortIcon("title")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                      <div className="flex items-center">
                        Категория {renderSortIcon("category")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                      <div className="flex items-center">
                        Цена/день {renderSortIcon("price")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("year")}>
                      <div className="flex items-center">
                        Год {renderSortIcon("year")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("available")}>
                      <div className="flex items-center">
                        Статус {renderSortIcon("available")}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCars.length > 0 ? (
                    filteredAndSortedCars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.title}</TableCell>
                        <TableCell>{car.category}</TableCell>
                        <TableCell>{car.price} ₽</TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>
                          <Badge variant={car.available ? "success" : "destructive"}>
                            {car.available ? "Доступен" : "Недоступен"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenCarDialog(car)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удаление автомобиля</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Вы уверены, что хотите удалить автомобиль "{car.title}"? Это действие нельзя отменить.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteCar(car.id)}
                                  >
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {searchQuery ? "Автомобили не найдены" : "Нет доступных автомобилей"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Диалог для создания/редактирования автомобиля */}
      <Dialog open={openCarDialog} onOpenChange={setOpenCarDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentCar?.id ? "Редактирование автомобиля" : "Добавление автомобиля"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об автомобиле
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Название</label>
                <Input
                  id="title"
                  value={currentCar?.title || ""}
                  onChange={(e) => handleCarFieldChange("title", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Категория</label>
                <Select
                  value={currentCar?.category || ""}
                  onValueChange={(value) => handleCarFieldChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Эконом">Эконом</SelectItem>
                    <SelectItem value="Бизнес">Бизнес</SelectItem>
                    <SelectItem value="Премиум">Премиум</SelectItem>
                    <SelectItem value="Кроссовер">Кроссовер</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Описание</label>
              <Textarea
                id="description"
                value={currentCar?.description || ""}
                onChange={(e) => handleCarFieldChange("description", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Цена в день (₽)</label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={currentCar?.price || 0}
                  onChange={(e) => handleCarFieldChange("price", Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">Год выпуска</label>
                <Input
                  id="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={currentCar?.year || new Date().getFullYear()}
                  onChange={(e) => handleCarFieldChange("year", Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="seats" className="text-sm font-medium">Мест</label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="9"
                  value={currentCar?.seats || 5}
                  onChange={(e) => handleCarFieldChange("seats", Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="transmission" className="text-sm font-medium">Трансмиссия</label>
                <Select
                  value={currentCar?.transmission || "Автомат"}
                  onValueChange={(value) => handleCarFieldChange("transmission", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Автомат">Автомат</SelectItem>
                    <SelectItem value="Механика">Механика</SelectItem>
                    <SelectItem value="Робот">Робот</SelectItem>
                    <SelectItem value="Вариатор">Вариатор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="fuel" className="text-sm font-medium">Топливо</label>
                <Select
                  value={currentCar?.fuel || "Бензин"}
                  onValueChange={(value) => handleCarFieldChange("fuel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Бензин">Бензин</SelectItem>
                    <SelectItem value="Дизель">Дизель</SelectItem>
                    <SelectItem value="Гибрид">Гибрид</SelectItem>
                    <SelectItem value="Электро">Электро</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">URL основного изображения</label>
              <Input
                id="image"
                value={currentCar?.image || ""}
                onChange={(e) => handleCarFieldChange("image", e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={currentCar?.available || false}
                onChange={(e) => handleCarFieldChange("available", e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="available" className="text-sm font-medium">Доступен для бронирования</label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCarDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSaveCar} 
              disabled={operationLoading}
              className="relative"
            >
              {operationLoading && (
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              )}
              {currentCar?.id ? "Сохранить изменения" : "Добавить автомобиль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCars;

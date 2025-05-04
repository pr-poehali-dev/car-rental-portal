
import { useState } from "react";
import Header from "@/components/Header";
import CarCard, { CarProps } from "@/components/CarCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const Index = () => {
  // Демо-данные для каталога
  const carsData: CarProps[] = [
    {
      id: "1",
      title: "Toyota Camry",
      price: 3500,
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2023,
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      category: "Бизнес"
    },
    {
      id: "2",
      title: "Kia Rio",
      price: 1800,
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2022,
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      category: "Эконом"
    },
    {
      id: "3",
      title: "Mercedes-Benz E-class",
      price: 5900,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2023,
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      category: "Премиум"
    },
    {
      id: "4",
      title: "Volkswagen Polo",
      price: 2100,
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2021,
      seats: 5,
      transmission: "Механика",
      fuel: "Бензин",
      category: "Эконом"
    },
    {
      id: "5",
      title: "Hyundai Creta",
      price: 2800,
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2022,
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      category: "Кроссовер"
    },
    {
      id: "6",
      title: "BMW X5",
      price: 7500,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      year: 2023,
      seats: 5,
      transmission: "Автомат",
      fuel: "Дизель",
      category: "Премиум"
    }
  ];

  const [priceRange, setPriceRange] = useState([1000, 8000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Фильтрация автомобилей
  const filteredCars = carsData.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1];
    const matchesCategory = !filterCategory || car.category === filterCategory;
    
    return matchesSearch && matchesPrice && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero секция */}
        <section className="py-12 text-center mb-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Аренда автомобилей в вашем городе</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Широкий выбор автомобилей разных классов по доступным ценам. Бронируйте онлайн за пару минут!
          </p>
          <Button size="lg" className="px-8">Забронировать сейчас</Button>
        </section>
        
        {/* Поиск и фильтры */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Поиск автомобиля" 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto w-full"
            >
              <Filter className="mr-2 h-4 w-4" /> Фильтры
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 border rounded-md grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <Select 
                  value={filterCategory} 
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все категории</SelectItem>
                    <SelectItem value="Эконом">Эконом</SelectItem>
                    <SelectItem value="Бизнес">Бизнес</SelectItem>
                    <SelectItem value="Премиум">Премиум</SelectItem>
                    <SelectItem value="Кроссовер">Кроссовер</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Цена в день: {priceRange[0]} ₽ - {priceRange[1]} ₽
                </label>
                <Slider 
                  value={priceRange}
                  min={1000}
                  max={10000}
                  step={100}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>
            </div>
          )}
        </section>
        
        {/* Каталог автомобилей */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Доступные автомобили</h2>
          
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map(car => (
                <CarCard key={car.id} {...car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500">Автомобили не найдены</p>
              <p className="text-gray-400 mt-2">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </section>
      </main>
      
      <footer className="bg-gray-50 border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-primary mb-3">АвтоПрокат</h3>
              <p className="text-gray-600 max-w-md">
                Удобный сервис аренды автомобилей в вашем городе. Работаем с 2018 года.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-3">Навигация</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-600 hover:text-primary">Главная</Link></li>
                  <li><Link to="/about" className="text-gray-600 hover:text-primary">О нас</Link></li>
                  <li><Link to="/contacts" className="text-gray-600 hover:text-primary">Контакты</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Информация</h4>
                <ul className="space-y-2">
                  <li><Link to="/terms" className="text-gray-600 hover:text-primary">Условия аренды</Link></li>
                  <li><Link to="/policy" className="text-gray-600 hover:text-primary">Политика конфиденциальности</Link></li>
                  <li><Link to="/faq" className="text-gray-600 hover:text-primary">Частые вопросы</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Контакты</h4>
                <ul className="space-y-2">
                  <li className="text-gray-600">+7 (123) 456-78-90</li>
                  <li className="text-gray-600">info@avtoprokat.ru</li>
                  <li className="text-gray-600">г. Москва, ул. Примерная, 123</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 text-center text-gray-500 text-sm">
            © 2025 АвтоПрокат. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

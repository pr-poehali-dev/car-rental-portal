
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Car, 
  CalendarClock, 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: "Главная",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      path: "/admin",
    },
    {
      title: "Автомобили",
      icon: <Car className="mr-2 h-4 w-4" />,
      path: "/admin/cars",
    },
    {
      title: "Бронирования",
      icon: <CalendarClock className="mr-2 h-4 w-4" />,
      path: "/admin/bookings",
    },
    {
      title: "Пользователи",
      icon: <Users className="mr-2 h-4 w-4" />,
      path: "/admin/users",
    },
    {
      title: "Настройки",
      icon: <Settings className="mr-2 h-4 w-4" />,
      path: "/admin/settings",
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API для выхода
      api.logout();
      
      toast({
        title: "Выход выполнен успешно",
        description: "Вы вышли из системы администрирования",
      });
      
      // Перенаправляем на главную страницу
      navigate('/');
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      toast({
        title: "Ошибка при выходе",
        description: "Не удалось выйти из системы. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen border-r bg-gray-50 w-64 flex flex-col">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">АвтоПрокат</span>
          <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
            Админ
          </span>
        </Link>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="py-4">
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-gray-500">
              УПРАВЛЕНИЕ
            </h3>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md w-full",
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.title}
                  </div>
                  {isActive(item.path) && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="mt-6 px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-gray-500">
              СИСТЕМНЫЕ ДЕЙСТВИЯ
            </h3>
            <div className="px-4 py-2">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Режим разработки</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      API работает в демо-режиме. Данные могут быть сброшены в любой момент.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={loggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? "Выполняется выход..." : "Выйти"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Выход из системы</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите выйти из панели администратора?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Выйти
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminSidebar;

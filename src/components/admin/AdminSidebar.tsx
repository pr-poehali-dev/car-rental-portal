
import { Link, useLocation } from "react-router-dom";
import { 
  Car, 
  CalendarClock, 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminSidebar = () => {
  const location = useLocation();
  
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
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;

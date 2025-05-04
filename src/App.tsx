
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminBookings from "./pages/admin/AdminBookings";
import { api } from "./lib/api";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // В реальном приложении здесь был бы запрос к API для проверки токена
        // await api.getProfile();
        
        // Для демо просто проверяем наличие токена
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Ошибка при проверке аутентификации:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Защищенный маршрут для админ-панели
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    // Пока проверяем аутентификацию, можно показать загрузку
    if (isAuthenticated === null) {
      return <div className="flex h-screen items-center justify-center">Загрузка...</div>;
    }

    // Для демо всегда разрешаем доступ
    // В реальном приложении здесь была бы проверка роли пользователя
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Админ панель */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="cars" element={<AdminCars />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<div>Управление пользователями</div>} />
              <Route path="settings" element={<div>Настройки</div>} />
            </Route>
            
            {/* Страница входа в админ-панель */}
            <Route path="/admin/login" element={
              isAuthenticated ? <Navigate to="/admin" replace /> : <div>Страница входа</div>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

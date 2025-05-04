
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">АвтоПрокат</Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            Каталог
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
            О нас
          </Link>
          <Link to="/contacts" className="text-gray-700 hover:text-primary transition-colors">
            Контакты
          </Link>
        </nav>
        
        {/* Action buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/cart">
            <Button variant="outline" size="icon" aria-label="Корзина">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="icon" aria-label="Личный кабинет">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/rent">
            <Button>Арендовать</Button>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Меню"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white border-t">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              О нас
            </Link>
            <Link 
              to="/contacts" 
              className="text-gray-700 hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>
            <div className="flex items-center space-x-4 py-2">
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="icon" aria-label="Корзина">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="icon" aria-label="Личный кабинет">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <Link to="/rent" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">Арендовать</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

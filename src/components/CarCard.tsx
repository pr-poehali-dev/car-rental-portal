
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Fuel, Gauge, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export interface CarProps {
  id: string;
  title: string;
  price: number;
  image: string;
  year: number;
  seats: number;
  transmission: string;
  fuel: string;
  category?: string;
}

const CarCard = ({
  id,
  title,
  price,
  image,
  year,
  seats,
  transmission,
  fuel,
  category
}: CarProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {category && (
          <Badge className="absolute top-3 right-3">{category}</Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-2xl font-bold text-primary">
          {price} ₽<span className="text-sm font-normal text-gray-500">/день</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{year} г.</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{seats} мест</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-gray-500" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-gray-500" />
            <span>{fuel}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Link to={`/cars/${id}`} className="w-full sm:flex-1">
          <Button variant="outline" className="w-full">Подробнее</Button>
        </Link>
        <Button className="w-full sm:flex-1">
          <ShoppingCart className="mr-2 h-4 w-4" /> В корзину
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;


import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export interface ItemProps {
  id: string;
  title: string;
  category: string;
  image: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  isHighValue?: boolean;
}

const ItemCard: React.FC<ItemProps> = ({
  id,
  title,
  category,
  image,
  location,
  date,
  status,
  isHighValue = false
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-card border border-border/40 h-full flex flex-col">
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            className={`${status === 'lost' ? 'bg-destructive text-destructive-foreground' : 'bg-green-500 text-white'} uppercase`}
          >
            {status}
          </Badge>
          
          {isHighValue && (
            <Badge 
              className="ml-2 bg-amber-500 text-white uppercase"
            >
              High Value
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-0 flex-none">
        <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{category}</p>
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 text-primary/70" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1 text-primary/70" />
            <span>{date}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-none">
        <Button asChild className="w-full">
          <Link to={`/item/${id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;

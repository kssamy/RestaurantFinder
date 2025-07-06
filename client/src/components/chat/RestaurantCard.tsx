import { Star, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onReserve: (restaurant: Restaurant) => void;
  onViewDetails: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, onReserve, onViewDetails }: RestaurantCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? 'fill-app-accent text-app-accent' : 'text-gray-300'}
      />
    ));
  };

  const getImageUrl = (restaurant: Restaurant) => {
    if (restaurant.imageUrl) return restaurant.imageUrl;
    
    // Fallback images based on cuisine
    const cuisineImages: Record<string, string> = {
      'Italian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80',
      'French': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80',
      'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80',
      'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80',
      'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80',
    };
    
    return cuisineImages[restaurant.cuisine] || cuisineImages['Italian'];
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-sm">
      <div className="flex space-x-3">
        <img
          src={getImageUrl(restaurant)}
          alt={`${restaurant.name} restaurant`}
          className="w-16 h-16 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80';
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-app-neutral-900 truncate">
            {restaurant.name}
          </h4>
          <p className="text-xs text-neutral-600 mb-1">
            {restaurant.cuisine} • {restaurant.priceRange} • {restaurant.address?.split(',')[0]}
          </p>
          <div className="flex items-center space-x-1 mb-1">
            <div className="flex">
              {renderStars(restaurant.rating)}
            </div>
            <span className="text-xs text-neutral-600">
              {restaurant.rating}.0 ({restaurant.reviewCount})
            </span>
          </div>
          {restaurant.phone && (
            <div className="flex items-center space-x-1 text-xs text-neutral-500">
              <Phone size={10} />
              <span className="truncate">{restaurant.phone}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex space-x-2 mt-3">
        <Button
          onClick={() => onReserve(restaurant)}
          className="flex-1 bg-app-primary hover:bg-app-primary/90 text-white text-xs h-8"
          disabled={!restaurant.phone}
        >
          <Phone size={12} className="mr-1" />
          Reserve Table
        </Button>
        <Button
          onClick={() => onViewDetails(restaurant)}
          variant="outline"
          className="text-xs h-8 px-3"
        >
          Details
        </Button>
      </div>
    </div>
  );
}

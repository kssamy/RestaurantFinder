import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import type { Favorite } from '@/lib/types';

export default function Favorites() {
  const queryClient = useQueryClient();
  
  const { data: favorites, isLoading } = useQuery<(Favorite & { restaurant: any })[]>({
    queryKey: ['/api/favorites'],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (restaurantId: number) => {
      await apiRequest('DELETE', `/api/favorites/${restaurantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? 'fill-app-accent text-app-accent' : 'text-gray-300'}
      />
    ));
  };

  const handleRemoveFavorite = (restaurantId: number) => {
    removeFavoriteMutation.mutate(restaurantId);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header />
      
      <main className="pb-32 pt-4">
        <div className="px-4">
          <h2 className="text-xl font-semibold text-app-neutral-900 mb-4">
            Favorite Restaurants
          </h2>
          
          {favorites?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover restaurants and add them to your favorites for quick access.
                </p>
                <Button className="bg-app-primary hover:bg-app-primary/90">
                  Discover Restaurants
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites?.map((favorite) => {
                const restaurant = favorite.restaurant;
                
                return (
                  <Card key={favorite.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-3 flex-1">
                          {restaurant.imageUrl && (
                            <img
                              src={restaurant.imageUrl}
                              alt={restaurant.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">
                              {restaurant.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {restaurant.cuisine} • {restaurant.priceRange}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="flex">
                                {renderStars(restaurant.rating)}
                              </div>
                              <span className="text-xs text-gray-600">
                                {restaurant.rating}.0 ({restaurant.reviewCount})
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFavorite(restaurant.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-2">
                      {restaurant.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-3">
                        <Button className="flex-1 bg-app-primary hover:bg-app-primary/90 text-white">
                          Make Reservation
                        </Button>
                        <Button variant="outline" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

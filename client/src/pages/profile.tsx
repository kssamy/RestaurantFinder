import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Settings, Star, Calendar, Heart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User as UserType } from '@/lib/types';

export default function Profile() {
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ['/api/user'],
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 rounded-xl h-32"></div>
            <div className="bg-gray-200 rounded-xl h-24"></div>
            <div className="bg-gray-200 rounded-xl h-24"></div>
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
        <div className="px-4 space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-app-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl">{user?.username}</CardTitle>
                  {user?.location && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dining Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.preferences?.cuisines && user.preferences.cuisines.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.preferences.cuisines.map((cuisine) => (
                      <Badge key={cuisine} variant="secondary">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {user?.preferences?.priceRange && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                  <Badge variant="outline">{user.preferences.priceRange}</Badge>
                </div>
              )}
              
              {user?.preferences?.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.preferences.dietaryRestrictions.map((restriction) => (
                      <Badge key={restriction} variant="outline" className="bg-red-50 text-red-700">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <Button variant="outline" className="w-full">
                <Settings size={16} className="mr-2" />
                Edit Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="mx-auto h-8 w-8 text-app-primary mb-2" />
                <p className="text-2xl font-bold text-app-neutral-900">0</p>
                <p className="text-xs text-gray-600">Reservations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="mx-auto h-8 w-8 text-app-primary mb-2" />
                <p className="text-2xl font-bold text-app-neutral-900">0</p>
                <p className="text-xs text-gray-600">Favorites</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="mx-auto h-8 w-8 text-app-primary mb-2" />
                <p className="text-2xl font-bold text-app-neutral-900">0</p>
                <p className="text-xs text-gray-600">Reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Settings size={16} className="mr-3" />
                Account Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MapPin size={16} className="mr-3" />
                Update Location
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Star size={16} className="mr-3" />
                Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

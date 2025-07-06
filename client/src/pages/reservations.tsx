import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Phone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/lib/types';

export default function Reservations() {
  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ['/api/reservations'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'h:mm a'),
      isPast: date < new Date(),
    };
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
            My Reservations
          </h2>
          
          {reservations?.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reservations yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start a conversation with our AI assistant to find restaurants and make reservations.
                </p>
                <Button className="bg-app-primary hover:bg-app-primary/90">
                  Find Restaurants
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservations?.map((reservation) => {
                const { date, time, isPast } = formatDateTime(reservation.dateTime);
                
                return (
                  <Card key={reservation.id} className={isPast ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {reservation.restaurant?.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {reservation.restaurant?.cuisine} • {reservation.restaurant?.priceRange}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>{date}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>{time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{reservation.partySize} people</span>
                      </div>
                      
                      {reservation.restaurant?.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span className="truncate">{reservation.restaurant.address}</span>
                        </div>
                      )}
                      
                      {reservation.restaurant?.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone size={16} />
                          <span>{reservation.restaurant.phone}</span>
                        </div>
                      )}
                      
                      {reservation.confirmationDetails?.specialRequests && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Special requests:</strong> {reservation.confirmationDetails.specialRequests}
                          </p>
                        </div>
                      )}
                      
                      {reservation.confirmationDetails?.confirmationNumber && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Confirmation #:</strong> {reservation.confirmationDetails.confirmationNumber}
                          </p>
                        </div>
                      )}
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

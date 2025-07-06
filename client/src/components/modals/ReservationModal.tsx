import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/lib/types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export function ReservationModal({ isOpen, onClose, reservation }: ReservationModalProps) {
  if (!reservation) return null;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDateTime(reservation.dateTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-4">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-app-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-app-neutral-900 mb-2">
            {reservation.status === 'confirmed' ? 'Reservation Confirmed!' : 'Reservation Requested!'}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            {reservation.status === 'confirmed' 
              ? `I've successfully booked your table at ${reservation.restaurant?.name}`
              : `I've placed a call to ${reservation.restaurant?.name} for your reservation`
            }
          </p>
          <div className="bg-app-neutral-100 rounded-xl p-3 mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Restaurant:</span>
              <span className="font-medium">{reservation.restaurant?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Date:</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Time:</span>
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Party Size:</span>
              <span className="font-medium">{reservation.partySize} people</span>
            </div>
            {reservation.status === 'pending' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Status:</span>
                <span className="font-medium text-amber-600">Calling restaurant...</span>
              </div>
            )}
          </div>
          <Button
            onClick={onClose}
            className="w-full bg-app-primary hover:bg-app-primary/90 text-white"
          >
            Great, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

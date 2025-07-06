import { Settings, MapPin, Utensils } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/lib/types';

export function Header() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  return (
    <header className="bg-white border-b border-neutral-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-app-primary rounded-full flex items-center justify-center">
          <Utensils className="text-white" size={16} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-app-neutral-900">RestaurantAI</h1>
          <div className="flex items-center space-x-1 text-xs text-neutral-600">
            <MapPin className="app-primary" size={12} />
            <span>{user?.location || 'Location not set'}</span>
          </div>
        </div>
      </div>
      <button className="w-8 h-8 bg-app-neutral-100 rounded-full flex items-center justify-center">
        <Settings className="text-neutral-600" size={16} />
      </button>
    </header>
  );
}

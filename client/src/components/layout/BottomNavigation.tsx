import { MessageCircle, Calendar, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: MessageCircle, label: 'Chat' },
  { path: '/reservations', icon: Calendar, label: 'Reservations' },
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-20">
      <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <Link key={path} href={path}>
                <button
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-colors",
                    isActive
                      ? "bg-app-primary/10 text-app-primary"
                      : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

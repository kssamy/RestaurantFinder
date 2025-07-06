import { Phone } from 'lucide-react';

interface CallIndicatorProps {
  restaurantName: string;
  isVisible: boolean;
}

export function CallIndicator({ restaurantName, isVisible }: CallIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-app-secondary/10 border border-app-secondary/20 rounded-xl p-3 mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-app-secondary rounded-full flex items-center justify-center animate-pulse">
          <Phone className="text-white" size={12} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-app-secondary">
            Calling {restaurantName}...
          </p>
          <p className="text-xs text-neutral-600">
            I'm speaking with the restaurant now
          </p>
        </div>
        <div className="flex space-x-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-1 h-4 bg-app-secondary rounded-full animate-pulse"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

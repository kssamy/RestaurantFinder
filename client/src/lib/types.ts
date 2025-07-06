export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface Restaurant {
  id: number;
  yelpId?: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  address: string;
  imageUrl?: string;
  coordinates?: { latitude: number; longitude: number };
  hours?: Record<string, string>;
}

export interface Reservation {
  id: number;
  userId: number;
  restaurantId: number;
  conversationId?: number;
  partySize: number;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  callSid?: string;
  confirmationDetails?: {
    confirmationNumber?: string;
    specialRequests?: string;
    callTranscript?: string;
  };
  createdAt: string;
  restaurant?: Restaurant;
}

export interface User {
  id: number;
  username: string;
  location?: string;
  preferences?: {
    cuisines?: string[];
    priceRange?: string;
    dietaryRestrictions?: string[];
  };
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId?: number;
  messages: ChatMessage[];
  context?: {
    lastLocation?: string;
    lastCuisine?: string;
    activeReservation?: any;
    lastIntent?: string;
    lastRecommendations?: Restaurant[];
  };
  createdAt: string;
  updatedAt: string;
}

import { 
  users, 
  conversations, 
  restaurants, 
  reservations, 
  favorites,
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Restaurant,
  type InsertRestaurant,
  type Reservation,
  type InsertReservation,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Restaurants
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantByYelpId(yelpId: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  searchRestaurants(filters: { cuisine?: string; location?: string; priceRange?: string }): Promise<Restaurant[]>;

  // Reservations
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservationsByUser(userId: number): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined>;

  // Favorites
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, restaurantId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private conversations: Map<number, Conversation> = new Map();
  private restaurants: Map<number, Restaurant> = new Map();
  private reservations: Map<number, Reservation> = new Map();
  private favorites: Map<number, Favorite> = new Map();
  
  private currentUserId = 1;
  private currentConversationId = 1;
  private currentRestaurantId = 1;
  private currentReservationId = 1;
  private currentFavoriteId = 1;

  constructor() {
    // Create a default user
    this.createUser({
      username: "user",
      location: "Downtown SF",
      preferences: {
        cuisines: ["Italian", "Japanese"],
        priceRange: "$$",
        dietaryRestrictions: []
      }
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser,
      location: insertUser.location || null,
      preferences: insertUser.preferences ? {
        cuisines: insertUser.preferences.cuisines as string[] | undefined,
        priceRange: insertUser.preferences.priceRange as string | undefined,
        dietaryRestrictions: insertUser.preferences.dietaryRestrictions as string[] | undefined,
      } : null,
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Conversations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      userId: insertConversation.userId || null,
      messages: insertConversation.messages ? insertConversation.messages as Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
        metadata?: any;
      }> : null,
      context: insertConversation.context ? {
        lastLocation: insertConversation.context.lastLocation as string | undefined,
        lastCuisine: insertConversation.context.lastCuisine as string | undefined,
        activeReservation: insertConversation.context.activeReservation,
        lastIntent: insertConversation.context.lastIntent as string | undefined,
        lastRecommendations: insertConversation.context.lastRecommendations as any[] | undefined,
      } : null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { 
      ...conversation, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Restaurants
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurantByYelpId(yelpId: string): Promise<Restaurant | undefined> {
    return Array.from(this.restaurants.values()).find(restaurant => restaurant.yelpId === yelpId);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.currentRestaurantId++;
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id,
      yelpId: insertRestaurant.yelpId || null,
      cuisine: insertRestaurant.cuisine || null,
      priceRange: insertRestaurant.priceRange || null,
      rating: insertRestaurant.rating || null,
      reviewCount: insertRestaurant.reviewCount || null,
      phone: insertRestaurant.phone || null,
      address: insertRestaurant.address || null,
      imageUrl: insertRestaurant.imageUrl || null,
      coordinates: insertRestaurant.coordinates || null,
      hours: insertRestaurant.hours || null,
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async searchRestaurants(filters: { cuisine?: string; location?: string; priceRange?: string }): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(restaurant => {
      if (filters.cuisine && !restaurant.cuisine?.toLowerCase().includes(filters.cuisine.toLowerCase())) {
        return false;
      }
      if (filters.priceRange && restaurant.priceRange !== filters.priceRange) {
        return false;
      }
      return true;
    });
  }

  // Reservations
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async getReservationsByUser(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(res => res.userId === userId);
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      userId: insertReservation.userId || null,
      restaurantId: insertReservation.restaurantId || null,
      conversationId: insertReservation.conversationId || null,
      status: insertReservation.status || 'pending',
      callSid: insertReservation.callSid || null,
      confirmationDetails: insertReservation.confirmationDetails ? {
        confirmationNumber: insertReservation.confirmationDetails.confirmationNumber as string | undefined,
        specialRequests: insertReservation.confirmationDetails.specialRequests as string | undefined,
        callTranscript: insertReservation.confirmationDetails.callTranscript as string | undefined,
      } : null,
      createdAt: new Date()
    };
    this.reservations.set(id, reservation);
    return reservation;
  }

  async updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    
    const updatedReservation = { ...reservation, ...updates };
    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }

  // Favorites
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(fav => fav.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      userId: insertFavorite.userId || null,
      restaurantId: insertFavorite.restaurantId || null,
      createdAt: new Date()
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(userId: number, restaurantId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.restaurantId === restaurantId
    );
    
    if (favorite) {
      this.favorites.delete(favorite.id);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();

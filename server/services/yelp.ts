import { storage } from "../storage";
import type { Restaurant } from "@shared/schema";

interface YelpRestaurant {
  id: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{ alias: string; title: string }>;
  rating: number;
  coordinates: { latitude: number; longitude: number };
  transactions: string[];
  price: string;
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number;
}

interface YelpSearchResponse {
  businesses: YelpRestaurant[];
  total: number;
  region: {
    center: { longitude: number; latitude: number };
  };
}

export class YelpService {
  private apiKey: string;
  private baseUrl = 'https://api.yelp.com/v3';

  constructor() {
    this.apiKey = process.env.YELP_API_KEY || process.env.YELP_FUSION_API_KEY || "default_key";
  }

  async searchRestaurants(params: {
    location: string;
    term?: string;
    categories?: string;
    price?: string;
    limit?: number;
    radius?: number;
    sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
  }): Promise<Restaurant[]> {
    try {
      const searchParams = new URLSearchParams({
        location: params.location,
        limit: (params.limit || 10).toString(),
        radius: (params.radius || 5000).toString(),
        sort_by: params.sort_by || 'best_match',
      });

      if (params.term) searchParams.append('term', params.term);
      if (params.categories) searchParams.append('categories', params.categories);
      if (params.price) searchParams.append('price', params.price);

      const response = await fetch(`${this.baseUrl}/businesses/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data: YelpSearchResponse = await response.json();
      
      // Convert Yelp format to our Restaurant format and store
      const restaurants: Restaurant[] = [];
      
      for (const business of data.businesses) {
        // Check if restaurant already exists
        let restaurant = await storage.getRestaurantByYelpId(business.id);
        
        if (!restaurant) {
          // Create new restaurant record
          restaurant = await storage.createRestaurant({
            yelpId: business.id,
            name: business.name,
            cuisine: business.categories[0]?.title || 'Restaurant',
            priceRange: business.price || '$$',
            rating: Math.round(business.rating),
            reviewCount: business.review_count,
            phone: business.phone,
            address: business.location.display_address.join(', '),
            imageUrl: business.image_url,
            coordinates: business.coordinates,
            hours: {}, // Would need separate API call for hours
          });
        }
        
        restaurants.push(restaurant);
      }

      return restaurants;
    } catch (error) {
      console.error('Yelp API error:', error);
      throw new Error(`Failed to search restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRestaurantDetails(yelpId: string): Promise<YelpRestaurant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/businesses/${yelpId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Yelp API error:', error);
      return null;
    }
  }

  async searchByPreferences(preferences: {
    location: string;
    cuisine?: string;
    priceRange?: string;
    mood?: string;
    dietaryRestrictions?: string[];
  }): Promise<Restaurant[]> {
    let categories = '';
    let term = '';

    // Map cuisine preferences to Yelp categories
    if (preferences.cuisine) {
      const cuisineMap: Record<string, string> = {
        'Italian': 'italian',
        'Japanese': 'japanese',
        'Mexican': 'mexican',
        'Chinese': 'chinese',
        'Indian': 'indpak',
        'French': 'french',
        'Thai': 'thai',
        'Mediterranean': 'mediterranean',
        'American': 'newamerican',
        'Seafood': 'seafood',
      };
      categories = cuisineMap[preferences.cuisine] || preferences.cuisine.toLowerCase();
    }

    // Handle mood-based search
    if (preferences.mood) {
      const moodTerms: Record<string, string> = {
        'romantic': 'romantic intimate',
        'casual': 'casual family',
        'upscale': 'upscale fine dining',
        'quick': 'fast casual',
        'healthy': 'healthy fresh',
      };
      term = moodTerms[preferences.mood.toLowerCase()] || preferences.mood;
    }

    // Map price range
    let price = '';
    if (preferences.priceRange) {
      const priceMap: Record<string, string> = {
        '$': '1',
        '$$': '1,2',
        '$$$': '2,3',
        '$$$$': '3,4',
      };
      price = priceMap[preferences.priceRange] || '1,2';
    }

    return this.searchRestaurants({
      location: preferences.location,
      term,
      categories,
      price,
      limit: 10,
    });
  }
}

export const yelpService = new YelpService();

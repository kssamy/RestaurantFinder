import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  location: text("location"),
  preferences: jsonb("preferences").$type<{
    cuisines?: string[];
    priceRange?: string;
    dietaryRestrictions?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  messages: jsonb("messages").$type<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: any;
  }>>().default([]),
  context: jsonb("context").$type<{
    lastLocation?: string;
    lastCuisine?: string;
    activeReservation?: any;
    lastIntent?: string;
    lastRecommendations?: any[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  yelpId: text("yelp_id").unique(),
  name: text("name").notNull(),
  cuisine: text("cuisine"),
  priceRange: text("price_range"),
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  phone: text("phone"),
  address: text("address"),
  imageUrl: text("image_url"),
  coordinates: jsonb("coordinates").$type<{ latitude: number; longitude: number }>(),
  hours: jsonb("hours").$type<Record<string, string>>(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  conversationId: integer("conversation_id").references(() => conversations.id),
  partySize: integer("party_size").notNull(),
  dateTime: timestamp("date_time").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  callSid: text("call_sid"), // Twilio call ID
  confirmationDetails: jsonb("confirmation_details").$type<{
    confirmationNumber?: string;
    specialRequests?: string;
    callTranscript?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

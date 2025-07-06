import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateChatResponse, 
  analyzeUserIntent, 
  generateRestaurantRecommendations,
  generateReservationCall
} from "./services/openai";
import { yelpService } from "./services/yelp";
import { twilioService } from "./services/twilio";
import { 
  insertConversationSchema,
  insertReservationSchema,
  insertFavoriteSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current user (for demo, always return user 1)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get or create conversation
  app.get("/api/conversation", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const conversations = await storage.getConversationsByUser(userId);
      
      let conversation;
      if (conversations.length === 0) {
        // Create new conversation
        conversation = await storage.createConversation({
          userId,
          messages: [],
          context: {}
        });
      } else {
        conversation = conversations[conversations.length - 1]; // Get latest
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });

  // Send message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message || !conversationId) {
        return res.status(400).json({ message: "Message and conversationId are required" });
      }

      // Get conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Get user context
      const user = await storage.getUser(conversation.userId!);
      const userContext = {
        location: user?.location,
        preferences: user?.preferences,
        conversationHistory: conversation.messages
      };

      // Analyze user intent
      const intent = await analyzeUserIntent(message, userContext);
      
      // Add user message to conversation
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
        metadata: { intent }
      };

      const updatedMessages = [...(conversation.messages || []), userMessage];

      let aiResponse = "";
      let recommendations = null;

      // Handle different intents
      if (intent.intent === 'search_restaurants' && userContext.location) {
        try {
          // Generate restaurant recommendations
          const recData = await generateRestaurantRecommendations(
            message,
            userContext.preferences,
            userContext.location
          );

          // Search for actual restaurants
          const searchResults = await yelpService.searchByPreferences({
            location: userContext.location,
            cuisine: intent.entities.cuisine,
            priceRange: intent.entities.priceRange,
            mood: intent.entities.mood,
          });

          recommendations = searchResults.slice(0, 3); // Limit to 3 recommendations
          
          aiResponse = `${recData.reasoning}\n\nI found some great options for you. Would you like me to call one of these restaurants to check availability?`;
        } catch (error) {
          console.error("Restaurant search error:", error);
          aiResponse = "I'm having trouble searching for restaurants right now. Let me help you in another way - could you tell me more about what you're looking for?";
        }
      } else {
        // Generate general AI response
        const chatMessages = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        aiResponse = await generateChatResponse(chatMessages, {
          location: userContext.location || undefined,
          preferences: userContext.preferences,
          conversationHistory: userContext.conversationHistory || undefined,
        });
      }

      // Add AI response to conversation
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: { 
          intent: intent.intent,
          recommendations: recommendations?.map(r => r.id) 
        }
      };

      const finalMessages = [...updatedMessages, aiMessage];

      // Update conversation
      await storage.updateConversation(conversationId, {
        messages: finalMessages,
        context: {
          ...conversation.context,
          lastIntent: intent.intent,
          lastRecommendations: recommendations
        }
      });

      res.json({
        message: aiMessage,
        recommendations,
        intent: intent.intent
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Make reservation call
  app.post("/api/reservation/call", async (req, res) => {
    try {
      const { restaurantId, partySize, date, time, specialRequests } = req.body;
      
      const restaurant = await storage.getRestaurant(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      if (!restaurant.phone) {
        return res.status(400).json({ message: "Restaurant phone number not available" });
      }

      const user = await storage.getUser(1); // Demo user
      
      const reservationDetails = {
        restaurantName: restaurant.name,
        date,
        time,
        partySize,
        specialRequests
      };

      // Generate call script
      const callData = await generateReservationCall(
        restaurant,
        reservationDetails,
        user
      );

      // Make the call
      const callResult = await twilioService.makeReservationCall(
        restaurant.phone,
        callData.callScript,
        {
          ...reservationDetails,
          customerName: user?.username || "Customer",
          customerPhone: "+1234567890" // Demo phone
        }
      );

      // Create reservation record
      const reservation = await storage.createReservation({
        userId: 1,
        restaurantId,
        conversationId: null, // Would link to current conversation
        partySize,
        dateTime: new Date(`${date} ${time}`),
        status: "pending",
        callSid: callResult.callSid,
        confirmationDetails: {
          specialRequests
        }
      });

      res.json({
        reservation,
        callStatus: callResult.status,
        estimatedDuration: callResult.estimatedDuration
      });
    } catch (error) {
      console.error("Reservation call error:", error);
      res.status(500).json({ message: "Failed to make reservation call" });
    }
  });

  // Check call status
  app.get("/api/reservation/call/:callSid/status", async (req, res) => {
    try {
      const { callSid } = req.params;
      const status = await twilioService.getCallStatus(callSid);
      res.json(status);
    } catch (error) {
      console.error("Call status error:", error);
      res.status(500).json({ message: "Failed to get call status" });
    }
  });

  // Get user reservations
  app.get("/api/reservations", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const reservations = await storage.getReservationsByUser(userId);
      
      // Get restaurant details for each reservation
      const reservationsWithDetails = await Promise.all(
        reservations.map(async (reservation) => {
          const restaurant = await storage.getRestaurant(reservation.restaurantId);
          return {
            ...reservation,
            restaurant
          };
        })
      );
      
      res.json(reservationsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reservations" });
    }
  });

  // Get user favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const favorites = await storage.getFavoritesByUser(userId);
      
      // Get restaurant details for each favorite
      const favoritesWithDetails = await Promise.all(
        favorites.map(async (favorite) => {
          const restaurant = await storage.getRestaurant(favorite.restaurantId);
          return {
            ...favorite,
            restaurant
          };
        })
      );
      
      res.json(favoritesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get favorites" });
    }
  });

  // Add/remove favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const { restaurantId } = req.body;
      const userId = 1; // Demo user
      
      const favorite = await storage.createFavorite({
        userId,
        restaurantId
      });
      
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:restaurantId", async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const userId = 1; // Demo user
      
      const success = await storage.deleteFavorite(userId, parseInt(restaurantId));
      
      if (success) {
        res.json({ message: "Favorite removed" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

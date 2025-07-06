import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RestaurantRecommendation {
  reasoning: string;
  recommendations: Array<{
    name: string;
    cuisine: string;
    priceRange: string;
    reason: string;
    searchQuery: string;
  }>;
  followUpQuestions?: string[];
}

export interface ReservationRequest {
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  userContext: {
    location?: string;
    preferences?: any;
    conversationHistory?: any[];
  }
): Promise<string> {
  const systemPrompt = `You are RestaurantAI, a friendly and knowledgeable dining assistant. You help users discover restaurants through natural conversation and can make reservations by calling restaurants.

Your capabilities:
- Understand user preferences through conversation
- Ask follow-up questions to refine choices
- Recommend restaurants with reasoning
- Handle complex requests like "romantic but not expensive"
- Remember conversation context
- Arrange restaurant reservations via phone calls

User context:
- Location: ${userContext.location || 'Not specified'}
- Preferences: ${JSON.stringify(userContext.preferences || {})}

Guidelines:
- Be conversational and friendly
- Ask clarifying questions when needed
- Provide specific restaurant recommendations with reasoning
- Explain why you're recommending specific places
- Offer to call restaurants for reservations
- Keep responses concise but helpful`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response from AI assistant");
  }
}

export async function analyzeUserIntent(
  message: string,
  context: any
): Promise<{
  intent: 'search_restaurants' | 'make_reservation' | 'general_chat' | 'modify_preferences';
  entities: any;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the user's message and extract intent and entities. Respond with JSON in this format:
{
  "intent": "search_restaurants|make_reservation|general_chat|modify_preferences",
  "entities": {
    "cuisine": "string or null",
    "priceRange": "string or null",
    "location": "string or null",
    "partySize": "number or null",
    "datetime": "string or null",
    "mood": "string or null",
    "dietaryRestrictions": "array or null"
  },
  "confidence": "number between 0 and 1"
}`
        },
        {
          role: "user",
          content: `Message: "${message}"\nContext: ${JSON.stringify(context)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Intent analysis error:", error);
    return {
      intent: 'general_chat',
      entities: {},
      confidence: 0.5
    };
  }
}

export async function generateRestaurantRecommendations(
  userRequest: string,
  userPreferences: any,
  location: string
): Promise<RestaurantRecommendation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a restaurant recommendation expert. Based on the user's request and preferences, provide restaurant recommendations with reasoning. Respond with JSON in this format:
{
  "reasoning": "explanation of why these restaurants fit the request",
  "recommendations": [
    {
      "name": "restaurant name for search",
      "cuisine": "cuisine type",
      "priceRange": "$, $$, $$$, or $$$$",
      "reason": "specific reason why this fits their request",
      "searchQuery": "search query for restaurant API"
    }
  ],
  "followUpQuestions": ["optional array of follow-up questions"]
}`
        },
        {
          role: "user",
          content: `Request: "${userRequest}"
Location: ${location}
User preferences: ${JSON.stringify(userPreferences)}

Provide 2-3 restaurant recommendations that match this request.`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Restaurant recommendation error:", error);
    throw new Error("Failed to generate restaurant recommendations");
  }
}

export async function generateReservationCall(
  restaurantInfo: any,
  reservationDetails: ReservationRequest,
  userInfo: any
): Promise<{
  callScript: string;
  expectedResponses: string[];
  fallbackOptions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a natural phone conversation script for making a restaurant reservation. The AI will use this to call the restaurant. Respond with JSON in this format:
{
  "callScript": "natural conversation script for the AI to follow",
  "expectedResponses": ["array of likely restaurant responses"],
  "fallbackOptions": ["array of alternative approaches if initial request fails"]
}`
        },
        {
          role: "user",
          content: `Restaurant: ${restaurantInfo.name}
Reservation details: ${JSON.stringify(reservationDetails)}
User info: ${JSON.stringify(userInfo)}

Generate a polite, professional call script for making this reservation.`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Call script generation error:", error);
    throw new Error("Failed to generate reservation call script");
  }
}

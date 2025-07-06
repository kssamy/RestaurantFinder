# RestaurantAI - Conversational Restaurant Reservation System

## Overview

RestaurantAI is a full-stack web application that provides an AI-powered conversational interface for restaurant discovery and reservation booking. The system combines natural language processing with real-time restaurant data to help users find and book dining experiences through an intuitive chat interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color scheme and responsive design
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Architecture**: RESTful endpoints with JSON responses
- **Development**: TypeScript with ES modules throughout

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Fixed bottom navigation for easy thumb navigation
- Maximum width container (md) centered for larger screens
- Touch-friendly interface elements

## Key Components

### Chat System
- **Natural Language Processing**: OpenAI GPT-4o integration for conversational AI
- **Intent Analysis**: Automatic detection of user preferences and requirements
- **Context Preservation**: Conversation history and user context maintained across sessions
- **Voice Interface**: Speech-to-text and text-to-speech capabilities for hands-free interaction

### Restaurant Discovery
- **Yelp Integration**: Real-time restaurant data fetching via Yelp Fusion API
- **Smart Recommendations**: AI-generated suggestions based on user preferences
- **Geolocation Support**: Location-based restaurant search and filtering
- **Rich Restaurant Data**: Ratings, reviews, cuisine types, price ranges, and photos

### Reservation System
- **Automated Calling**: Twilio integration for making actual phone calls to restaurants
- **Call Script Generation**: AI-generated conversation scripts for reservation requests
- **Real-time Status**: Live updates on call progress and reservation confirmation
- **Reservation Management**: Full CRUD operations for user reservations

### User Management
- **Profile System**: User preferences, location, and dietary restrictions
- **Favorites**: Save and manage favorite restaurants
- **Conversation History**: Persistent chat sessions across device sessions

## Data Flow

1. **User Input**: Natural language input via chat interface or voice
2. **Intent Analysis**: OpenAI processes input to understand user requirements
3. **Restaurant Search**: Yelp API called with extracted parameters
4. **AI Recommendations**: OpenAI generates personalized suggestions with reasoning
5. **User Selection**: Interactive restaurant cards for selection
6. **Reservation Request**: Twilio initiates phone call to restaurant
7. **Status Updates**: Real-time feedback on reservation process
8. **Confirmation**: Final reservation details stored and displayed

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4o model for natural language processing and conversation
- **Yelp Fusion API**: Restaurant data, search, and business information
- **Twilio**: Voice calling service for automated restaurant reservations
- **Neon Database**: Serverless PostgreSQL hosting

### UI Dependencies
- **@radix-ui/react-***: Comprehensive accessible UI component library
- **@tanstack/react-query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities
- **lucide-react**: Modern icon library with consistent design

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

## Deployment Strategy

### Development Environment
- **Development Server**: TSX for hot-reloading TypeScript execution
- **Database**: Drizzle push for schema synchronization
- **Asset Pipeline**: Vite dev server with HMR support
- **Replit Integration**: Cartographer plugin for enhanced development experience

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling server code into single executable
- **Database**: Drizzle migrations for production schema management
- **Environment Variables**: Secure configuration for API keys and database connections

### Database Schema
- **Users**: Profile information, preferences, and location data
- **Conversations**: Chat history with JSON message storage and context
- **Restaurants**: Cached restaurant data from Yelp with extended metadata
- **Reservations**: Booking details with call tracking and confirmation status
- **Favorites**: User-restaurant relationship management

The application follows modern web development best practices with type safety, responsive design, and scalable architecture patterns suitable for both development and production environments.

## Changelog
- July 06, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
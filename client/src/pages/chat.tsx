import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { RestaurantCard } from '@/components/chat/RestaurantCard';
import { VoiceInput } from '@/components/chat/VoiceInput';
import { CallIndicator } from '@/components/chat/CallIndicator';
import { ReservationModal } from '@/components/modals/ReservationModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/use-chat';
import { useSpeech } from '@/hooks/use-speech';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Restaurant, Reservation } from '@/lib/types';

const quickSuggestions = [
  'Find nearby sushi',
  'Something healthy',
  'Good for groups',
  'Romantic dinner',
];

export default function Chat() {
  const [inputValue, setInputValue] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [isCallingRestaurant, setIsCallingRestaurant] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  
  const { messages, sendMessage, isLoading, isSending, isTyping, recommendations } = useChat();
  const { speak } = useSpeech();

  // Make reservation mutation
  const makeReservationMutation = useMutation({
    mutationFn: async (data: {
      restaurantId: number;
      partySize: number;
      date: string;
      time: string;
      specialRequests?: string;
    }) => {
      const response = await apiRequest('POST', '/api/reservation/call', data);
      return response.json() as Promise<{ reservation: Reservation; callStatus: string; estimatedDuration: number }>;
    },
    onSuccess: (data) => {
      setCurrentReservation(data.reservation);
      setShowReservationModal(true);
      setIsCallingRestaurant(false);
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
    },
    onError: () => {
      setIsCallingRestaurant(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isSending) return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
  };

  const handleReserveRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsCallingRestaurant(true);
    
    // For demo, make a reservation for tonight at 7:30 PM for 2 people
    const today = new Date();
    const reservationDate = today.toISOString().split('T')[0];
    const reservationTime = '19:30';
    
    makeReservationMutation.mutate({
      restaurantId: restaurant.id,
      partySize: 2,
      date: reservationDate,
      time: reservationTime,
    });
  };

  const handleViewDetails = (restaurant: Restaurant) => {
    sendMessage(`Tell me more about ${restaurant.name}`);
  };

  const handleSpeakMessage = (content: string) => {
    speak(content);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Header />
      
      <main className="pb-40 pt-4 chat-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {/* Welcome Message */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-app-primary to-app-secondary rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <h2 className="font-semibold">AI Dining Assistant</h2>
                <p className="text-white/80 text-sm">Ready to help you find the perfect restaurant</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Tell me what you're in the mood for! I can help you find restaurants, make reservations, and even call them for you.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 px-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && <ChatMessage message={{} as any} isTyping />}
          
          {/* Restaurant Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              {recommendations.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onReserve={handleReserveRestaurant}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-100 p-4 z-10">
        
        {/* Call Indicator */}
        <CallIndicator
          restaurantName={selectedRestaurant?.name || ''}
          isVisible={isCallingRestaurant}
        />

        {/* Input Controls */}
        <div className="flex items-end space-x-3">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isSending}
          />
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me to find restaurants, make reservations..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="w-full bg-app-neutral-100 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-app-primary/20 focus:bg-white transition-colors min-h-[48px] max-h-[120px]"
              rows={1}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            size="icon"
            className="w-12 h-12 bg-app-primary hover:bg-app-primary/90 rounded-full"
          >
            <Send size={16} className="text-white" />
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
          {quickSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              onClick={() => handleQuickSuggestion(suggestion)}
              variant="outline"
              size="sm"
              className="bg-app-neutral-100 text-neutral-600 whitespace-nowrap flex-shrink-0 text-xs px-3 py-2 rounded-full"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      <BottomNavigation />
      
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        reservation={currentReservation}
      />
    </div>
  );
}

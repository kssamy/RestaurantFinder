import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ChatMessage, Conversation, Restaurant } from '@/lib/types';

interface ChatResponse {
  message: ChatMessage;
  recommendations?: Restaurant[];
  intent: string;
}

export function useChat() {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);

  // Get or create conversation
  const { data: conversation, isLoading } = useQuery<Conversation>({
    queryKey: ['/api/conversation'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId: number }) => {
      const response = await apiRequest('POST', '/api/chat', { message, conversationId });
      return response.json() as Promise<ChatResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      // Refetch conversation to get updated messages
      queryClient.invalidateQueries({ queryKey: ['/api/conversation'] });
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!conversation) return;
      return sendMessageMutation.mutate({ message, conversationId: conversation.id });
    },
    [conversation, sendMessageMutation]
  );

  const messages = conversation?.messages || [];
  const lastRecommendations = conversation?.context?.lastRecommendations || [];

  return {
    messages,
    sendMessage,
    isLoading,
    isSending: sendMessageMutation.isPending,
    isTyping,
    conversation,
    recommendations: lastRecommendations,
    error: sendMessageMutation.error,
  };
}

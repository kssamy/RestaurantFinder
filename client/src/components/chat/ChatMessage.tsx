import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessage;
  isTyping?: boolean;
}

export function ChatMessage({ message, isTyping }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp);

  if (isTyping) {
    return (
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-app-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white" size={12} />
        </div>
        <div className="bg-app-neutral-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-neutral-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-neutral-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-app-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white" size={12} />
        </div>
      )}
      
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
          isUser
            ? 'bg-app-primary text-white rounded-tr-md'
            : 'bg-app-neutral-100 text-app-neutral-900 rounded-tl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span
          className={`text-xs mt-1 block ${
            isUser ? 'text-primary-200' : 'text-neutral-500'
          }`}
        >
          {format(timestamp, 'h:mm a')}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-app-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-white" size={12} />
        </div>
      )}
    </div>
  );
}

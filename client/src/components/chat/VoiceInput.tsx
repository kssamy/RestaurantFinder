import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    isSpeaking,
  } = useSpeech();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        onTranscript(transcript);
      }
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Button
        size="icon"
        variant="outline"
        disabled
        className="w-12 h-12 rounded-full"
      >
        <MicOff size={16} />
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant={isListening ? "default" : "outline"}
      onClick={handleToggleListening}
      disabled={disabled}
      className={cn(
        "w-12 h-12 rounded-full transition-all",
        isListening && "bg-app-primary hover:bg-app-primary/90 ring-2 ring-app-primary/20"
      )}
    >
      {isSpeaking ? (
        <Volume2 size={16} className={isListening ? "text-white" : ""} />
      ) : isListening ? (
        <MicOff size={16} className="text-white" />
      ) : (
        <Mic size={16} />
      )}
    </Button>
  );
}

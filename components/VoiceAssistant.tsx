import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleGenAI } from '@google/genai';
import toast from 'react-hot-toast';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Indian English

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        await handleAskGemini(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== 'aborted') {
          toast.error("Microphone error. Please try again.");
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleAskGemini = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: "You are 'Mandi Mitra', a helpful AI voice assistant for the Smart Mandi app. You help farmers and buyers with agricultural queries, crop prices, and app navigation. Keep your answers extremely concise, conversational, and easy to understand when spoken out loud. Do not use markdown formatting like asterisks or bullet points, just plain text. Limit your response to 2-3 short sentences.",
        }
      });
      
      const answer = result.text || "Sorry, I couldn't understand that.";
      setResponse(answer);
      speakText(answer);
    } catch (error) {
      console.error("Gemini Error:", error);
      toast.error("Failed to get AI response.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice feature is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTranscript('');
      setResponse('');
      setIsOpen(true);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const closeAssistant = () => {
    window.speechSynthesis.cancel();
    if (isListening) recognitionRef.current?.stop();
    setIsListening(false);
    setIsSpeaking(false);
    setIsOpen(false);
    setTranscript('');
    setResponse('');
  };

  if (!recognitionRef.current && typeof window !== 'undefined') {
    return null; // Don't render if not supported
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-stone-200 w-72 sm:w-80 animate-in slide-in-from-bottom-5 relative">
          <button 
            onClick={closeAssistant}
            className="absolute top-2 right-2 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="mb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Mic className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-stone-800">Mandi Mitra</h3>
          </div>
          
          {isListening && !transcript && (
            <p className="text-sm text-stone-500 italic animate-pulse py-4 text-center">Listening...</p>
          )}

          {transcript && (
            <div className="mb-3 mt-2">
              <p className="text-xs text-stone-500 font-semibold mb-1">You asked:</p>
              <p className="text-sm text-stone-800 bg-stone-100 p-2 rounded-lg">{transcript}</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          )}
          
          {response && !isProcessing && (
            <div className="mt-2">
              <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1">
                <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-green-500' : ''}`} /> Answer:
              </p>
              <p className="text-sm text-stone-800 bg-green-50 p-2 rounded-lg leading-relaxed">{response}</p>
            </div>
          )}
        </div>
      )}
      
      <Button 
        onClick={toggleListening}
        size="icon"
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </Button>
    </div>
  );
}

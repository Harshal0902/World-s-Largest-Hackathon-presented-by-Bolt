import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, MessageCircle, Settings } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export const ElevenLabsVoiceInterface: React.FC = () => {
  const { voiceState, updateVoiceState } = useApp();
  const { isDark } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs conversation');
      setIsInitialized(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs conversation');
      setIsInitialized(false);
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      
      if (message.type === 'transcript') {
        updateVoiceState({ transcript: message.text });
      } else if (message.type === 'reply') {
        // Add assistant response to conversation
        const newConversation = [
          ...voiceState.conversation,
          {
            id: Date.now().toString(),
            type: 'assistant' as const,
            message: message.text,
            timestamp: new Date()
          }
        ];
        updateVoiceState({ 
          conversation: newConversation,
          isProcessing: false,
          isSpeaking: true
        });
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
      setError(error.message);
    }
  });

  const handleStartListening = async () => {
    try {
      setError(null);
      updateVoiceState({ isListening: true, transcript: '' });

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get agent ID from environment
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      
      if (!agentId) {
        throw new Error('ElevenLabs Agent ID not configured. Please set VITE_ELEVENLABS_AGENT_ID in your .env file');
      }

      // Start the conversation session
      await conversation.startSession({ agentId });
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice conversation');
      updateVoiceState({ isListening: false });
    }
  };

  const handleStopListening = async () => {
    try {
      await conversation.endSession();
      updateVoiceState({ isListening: false });
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error('Failed to change volume:', error);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          BIT10 AI Assistant (ElevenLabs)
        </h2>
        <div className="flex items-center space-x-2">
          {conversation.isSpeaking && <Volume2 className="h-5 w-5 text-green-500 animate-pulse" />}
          {voiceState.isProcessing && <MessageCircle className="h-5 w-5 text-blue-500 animate-spin" />}
          {!isInitialized && <Settings className="h-5 w-5 text-yellow-500" />}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <motion.button
          onClick={voiceState.isListening ? handleStopListening : handleStartListening}
          disabled={!isInitialized || voiceState.isProcessing || conversation.isSpeaking}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            voiceState.isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
          } ${!isInitialized || voiceState.isProcessing || conversation.isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {voiceState.isListening ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
          
          {/* Audio level visualization */}
          {voiceState.isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.button>

        {/* Status Text */}
        <div className="text-center">
          {!isInitialized && (
            <p className="text-yellow-500 font-medium">Initializing ElevenLabs...</p>
          )}
          {voiceState.isListening && (
            <p className="text-red-500 font-medium">Listening...</p>
          )}
          {voiceState.isProcessing && (
            <p className="text-blue-500 font-medium">Processing...</p>
          )}
          {conversation.isSpeaking && (
            <p className="text-green-500 font-medium">Speaking...</p>
          )}
          {isInitialized && !voiceState.isListening && !voiceState.isProcessing && !conversation.isSpeaking && (
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              "Hello BIT10 AI, can you give me a summary of the crypto market today?"
            </p>
          )}
        </div>

        {/* Current transcript */}
        {voiceState.transcript && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} max-w-full`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-medium">You said: </span>
              "{voiceState.transcript}"
            </p>
          </div>
        )}
      </div>

      {/* Audio Waveform Visualization */}
      {voiceState.isListening && (
        <div className="flex items-center justify-center space-x-1 mb-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-blue-500 to-green-500 w-1 rounded-full"
              animate={{
                height: [4, Math.random() * 40 + 4, 4]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05
              }}
            />
          ))}
        </div>
      )}

      {/* Conversation History */}
      <div className="space-y-3 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {voiceState.conversation.slice(-3).map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 rounded-lg ${
                item.type === 'user' 
                  ? isDark ? 'bg-blue-900/50 ml-8' : 'bg-blue-50 ml-8'
                  : isDark ? 'bg-green-900/50 mr-8' : 'bg-green-50 mr-8'
              }`}
            >
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">
                  {item.type === 'user' ? 'You: ' : 'Assistant: '}
                </span>
                {item.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}; 
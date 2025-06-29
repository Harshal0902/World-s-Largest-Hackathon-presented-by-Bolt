import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, MessageCircle, Settings, Zap, Activity, Brain } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export const VoiceInterface: React.FC = () => {
  const { voiceState, updateVoiceState } = useApp();
  const { isDark } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs conversation');
      setIsInitialized(true);
      setConnectionStatus('connected');
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs conversation');
      setIsInitialized(false);
      setConnectionStatus('disconnected');
      stopAudioAnalysis();
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      
      if (message.type === 'transcript') {
        updateVoiceState({ transcript: message.text });
      } else if (message.type === 'reply') {
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
      setConnectionStatus('disconnected');
    }
  });

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const handleStartListening = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');
      updateVoiceState({ isListening: true, transcript: '' });

      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startAudioAnalysis();

      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jyxcj8kpegcrjf8vnzcjhf23';
      
      if (!agentId) {
        throw new Error('ElevenLabs Agent ID not configured. Please set VITE_ELEVENLABS_AGENT_ID in your .env file');
      }

      await conversation.startSession({ agentId });
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice conversation');
      updateVoiceState({ isListening: false });
      setConnectionStatus('disconnected');
      stopAudioAnalysis();
    }
  }, [conversation, updateVoiceState]);

  const handleStopListening = useCallback(async () => {
    try {
      await conversation.endSession();
      updateVoiceState({ isListening: false });
      stopAudioAnalysis();
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, [conversation, updateVoiceState]);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
    };
  }, []);

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (connectionStatus === 'connected' && voiceState.isListening) return 'text-green-500';
    if (connectionStatus === 'connecting') return 'text-yellow-500';
    if (conversation.isSpeaking) return 'text-blue-500';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (voiceState.isProcessing) return 'Processing...';
    if (conversation.isSpeaking) return 'Speaking...';
    if (voiceState.isListening) return 'Listening...';
    if (connectionStatus === 'connecting') return 'Connecting...';
    if (connectionStatus === 'connected') return 'Ready to Listen';
    return 'Ready to Connect';
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              BIT10 AI Assistant
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Voice-powered crypto advisor
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {conversation.isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Volume2 className="h-6 w-6 text-green-500" />
            </motion.div>
          )}
          {voiceState.isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </motion.div>
          )}
          {connectionStatus === 'connecting' && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Settings className="h-6 w-6 text-yellow-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Voice Control */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        {/* Voice Button */}
        <div className="relative">
          <motion.button
            onClick={voiceState.isListening ? handleStopListening : handleStartListening}
            disabled={connectionStatus === 'connecting' || voiceState.isProcessing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              voiceState.isListening 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg shadow-blue-500/25'
            } ${connectionStatus === 'connecting' || voiceState.isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}`}
            whileHover={{ scale: connectionStatus === 'connecting' || voiceState.isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: connectionStatus === 'connecting' || voiceState.isProcessing ? 1 : 0.95 }}
          >
            {voiceState.isListening ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
            
            {/* Pulse animation for listening state */}
            {voiceState.isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/30"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
              </>
            )}
          </motion.button>

          {/* Audio level indicator */}
          {voiceState.isListening && audioLevel > 0 && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-end space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-t from-blue-500 to-green-500 w-1 rounded-full"
                    animate={{
                      height: [2, Math.max(2, audioLevel * 20 * (i + 1) / 5), 2]
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className={`text-lg font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {connectionStatus === 'connected' && !voiceState.isListening && !voiceState.isProcessing && !conversation.isSpeaking && (
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-md`}>
              Try saying: "Hello BIT10 AI, can you give me a summary of the crypto market today?"
            </p>
          )}
        </div>

        {/* Current Transcript */}
        <AnimatePresence>
          {voiceState.transcript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'} max-w-2xl`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                    You said:
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{voiceState.transcript}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Waveform Visualization */}
      {voiceState.isListening && (
        <div className="flex items-center justify-center space-x-1 mb-8">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-t from-blue-500 to-green-500 w-1 rounded-full"
              animate={{
                height: [4, Math.random() * 40 + 4, 4]
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.02,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Conversation History */}
      <div className="space-y-4 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {voiceState.conversation.slice(-3).map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl ${
                item.type === 'user' 
                  ? isDark ? 'bg-blue-900/30 ml-8 border border-blue-800/30' : 'bg-blue-50 ml-8 border border-blue-200'
                  : isDark ? 'bg-green-900/30 mr-8 border border-green-800/30' : 'bg-green-50 mr-8 border border-green-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-blue-500 to-green-500'
                }`}>
                  {item.type === 'user' ? (
                    <Mic className="h-4 w-4 text-white" />
                  ) : (
                    <Brain className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${
                    item.type === 'user' 
                      ? isDark ? 'text-blue-300' : 'text-blue-700'
                      : isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    {item.type === 'user' ? 'You' : 'BIT10 AI'}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {item.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Quick voice commands:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "What's Bitcoin's price?",
            "Market summary please",
            "How's my portfolio?",
            "Tell me about DeFi"
          ].map((command, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} cursor-pointer transition-colors group`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500 group-hover:text-green-500 transition-colors" />
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{command}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
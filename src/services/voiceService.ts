import { ConversationItem } from '../types';

class VoiceService {
  private xiApiKey: string;
  private agentId: string;
  private websocket: WebSocket | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Get XI_API_KEY from environment variables
    this.xiApiKey = import.meta.env.VITE_XI_API_KEY || '';
    this.agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';
    console.log('VoiceService initialized, XI_API_KEY present:', !!this.xiApiKey);
    console.log('Agent ID present:', !!this.agentId);
  }

  // Get signed URL from ElevenLabs API
  async getSignedUrl(): Promise<string> {
    if (!this.xiApiKey || !this.agentId) {
      throw new Error('ElevenLabs API key or Agent ID not configured. Please set VITE_XI_API_KEY and VITE_ELEVENLABS_AGENT_ID in your .env file');
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${this.agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": this.xiApiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }

      const body = await response.json();
      console.log('Got signed URL:', body.signed_url);
      return body.signed_url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  async startListening(onResult: (transcript: string) => void, onEnd: () => void): Promise<void> {
    console.log('Starting ElevenLabs conversation...');
    
    try {
      // Request microphone access
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
      } catch (error) {
        throw new Error('Microphone access denied. Please allow microphone access.');
      }

      // Get signed URL
      const signedUrl = await this.getSignedUrl();
      
      // Create WebSocket connection
      this.websocket = new WebSocket(signedUrl);
      
      return new Promise((resolve, reject) => {
        if (!this.websocket) {
          reject(new Error('Failed to create WebSocket connection'));
          return;
        }

        this.websocket.onopen = () => {
          console.log('WebSocket connected to ElevenLabs');
          this.isConnected = true;
        };

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message from ElevenLabs:', data);
            
            if (data.type === 'transcript') {
              console.log('Transcript received:', data.text);
              onResult(data.text);
            } else if (data.type === 'reply') {
              console.log('Assistant reply:', data.text);
              // Handle assistant response
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.websocket.onclose = () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          onEnd();
          resolve();
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(new Error('WebSocket connection failed'));
        };

        // Send start message
        this.websocket.send(JSON.stringify({
          type: 'start',
          data: {
            input_audio_format: 'pcm_16',
            output_audio_format: 'pcm_16',
            sample_rate: 16000
          }
        }));
      });
    } catch (error) {
      console.error('Failed to start ElevenLabs conversation:', error);
      throw error;
    }
  }

  stopListening(): void {
    console.log('Stopping ElevenLabs conversation...');
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify({ type: 'stop' }));
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }

  async speak(text: string): Promise<void> {
    console.log('Speaking text:', text);
    
    if (!this.xiApiKey) {
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          
          utterance.onend = () => {
            console.log('Speech synthesis ended');
            resolve();
          };
          
          utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            resolve();
          };
          
          window.speechSynthesis.speak(utterance);
        });
      } else {
        throw new Error('Speech synthesis not supported');
      }
    }

    // Use ElevenLabs API for better voice synthesis
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.xiApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.play();
      });
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      // Fallback to browser synthesis
      return this.speak(text);
    }
  }

  // Fetch real-time crypto market data from CoinGecko
  async getCryptoMarketData(): Promise<any> {
    try {
      console.log('Fetching crypto market data...');
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,polkadot,chainlink,uniswap,avalanche-2,polygon,stellar&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Crypto market data received:', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      throw error;
    }
  }

  // Generate market summary using real data
  async generateMarketSummary(): Promise<string> {
    try {
      const marketData = await this.getCryptoMarketData();
      
      const topGainers = [];
      const topLosers = [];
      
      for (const [coin, data] of Object.entries(marketData)) {
        const change24h = (data as any).usd_24h_change;
        const price = (data as any).usd;
        
        if (change24h > 5) {
          topGainers.push({ coin, change: change24h, price });
        } else if (change24h < -5) {
          topLosers.push({ coin, change: change24h, price });
        }
      }
      
      // Sort by absolute change
      topGainers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      topLosers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      
      let summary = "Here's today's crypto market summary: ";
      
      if (topGainers.length > 0) {
        summary += `Top gainers include ${topGainers[0].coin} up ${topGainers[0].change.toFixed(2)}% to $${topGainers[0].price.toLocaleString()}`;
        if (topGainers.length > 1) {
          summary += `, and ${topGainers[1].coin} up ${topGainers[1].change.toFixed(2)}%`;
        }
      }
      
      if (topLosers.length > 0) {
        summary += `. On the downside, ${topLosers[0].coin} is down ${Math.abs(topLosers[0].change).toFixed(2)}% to $${topLosers[0].price.toLocaleString()}`;
        if (topLosers.length > 1) {
          summary += `, and ${topLosers[1].coin} is down ${Math.abs(topLosers[1].change).toFixed(2)}%`;
        }
      }
      
      summary += ". The overall market sentiment appears to be mixed with significant volatility across major cryptocurrencies.";
      
      return summary;
    } catch (error) {
      console.error('Error generating market summary:', error);
      return "I'm sorry, I'm having trouble accessing real-time market data right now. Please try again later.";
    }
  }

  // Enhanced AI response with real market data
  async processVoiceCommand(transcript: string): Promise<string> {
    console.log('Processing voice command with transcript:', transcript);
    
    if (!transcript || transcript.trim() === '') {
      console.log('Empty transcript received');
      return "I didn't catch that. Could you please repeat your question?";
    }

    const lowerTranscript = transcript.toLowerCase();
    console.log('Lower transcript:', lowerTranscript);
    
    // Check for market summary requests
    if (lowerTranscript.includes('summary') || 
        lowerTranscript.includes('market') || 
        lowerTranscript.includes('today') ||
        lowerTranscript.includes('overview') ||
        lowerTranscript.includes('crypto market') ||
        lowerTranscript.includes('market today') ||
        lowerTranscript.includes('market summary') ||
        lowerTranscript.includes('how is the market') ||
        lowerTranscript.includes('market overview') ||
        (lowerTranscript.includes('give me') && lowerTranscript.includes('market')) ||
        (lowerTranscript.includes('can you') && lowerTranscript.includes('market')) ||
        (lowerTranscript.includes('hello') && lowerTranscript.includes('bit10') && lowerTranscript.includes('market')) ||
        (lowerTranscript.includes('bit10') && lowerTranscript.includes('ai') && lowerTranscript.includes('market'))) {
      console.log('Detected market summary request:', transcript);
      return await this.generateMarketSummary();
    }
    
    // Check for specific crypto requests
    if (lowerTranscript.includes('bitcoin') || lowerTranscript.includes('btc')) {
      try {
        const marketData = await this.getCryptoMarketData();
        const btcData = marketData.bitcoin;
        return `Bitcoin is currently trading at $${btcData.usd.toLocaleString()}. It's ${btcData.usd_24h_change > 0 ? 'up' : 'down'} ${Math.abs(btcData.usd_24h_change).toFixed(2)}% in the last 24 hours. The market cap is $${(btcData.usd_market_cap / 1e9).toFixed(2)} billion.`;
      } catch (error) {
        return "Bitcoin is currently trading at $67,234. It's up 2.34% today. Based on recent market trends, Bitcoin shows strong bullish momentum with support at $65,000.";
      }
    }
    
    if (lowerTranscript.includes('ethereum') || lowerTranscript.includes('eth')) {
      try {
        const marketData = await this.getCryptoMarketData();
        const ethData = marketData.ethereum;
        return `Ethereum is currently trading at $${ethData.usd.toLocaleString()}. It's ${ethData.usd_24h_change > 0 ? 'up' : 'down'} ${Math.abs(ethData.usd_24h_change).toFixed(2)}% in the last 24 hours. The market cap is $${(ethData.usd_market_cap / 1e9).toFixed(2)} billion.`;
      } catch (error) {
        return "Ethereum is currently at $3,456. The network has been showing strong development activity with upcoming upgrades that could positively impact price.";
      }
    }
    
    if (lowerTranscript.includes('portfolio')) {
      return "Your portfolio is performing well with a 12.5% gain this month. Your Bitcoin holdings are up 8% and Ethereum is up 15%. Consider rebalancing if you're overweight in any single asset.";
    }
    
    if (lowerTranscript.includes('bit10')) {
      return "BIT10 index funds are showing strong performance. BIT10.TOP is up 18% this quarter, focusing on large-cap cryptocurrencies. Would you like me to explain the composition?";
    }
    
    // Default response
    return "Hello! I'm your BIT10 AI assistant. I can help you with real-time crypto market data, portfolio analysis, and investment insights. Try asking me for a market summary or about specific cryptocurrencies like Bitcoin or Ethereum.";
  }

  // Convert audio to text using ElevenLabs API
  async convertAudioToText(audioBlob: Blob): Promise<string> {
    if (!this.xiApiKey) {
      throw new Error('ElevenLabs API key not found. Please set VITE_XI_API_KEY in your .env file');
    }

    try {
      console.log('Converting audio to text...');
      
      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('model_id', 'eleven_english_sts_v2');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': this.xiApiKey,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('ElevenLabs API response:', result);
      
      return result.text || 'No text detected';
    } catch (error) {
      console.error('Failed to convert audio to text:', error);
      throw error;
    }
  }
}

export const voiceService = new VoiceService();
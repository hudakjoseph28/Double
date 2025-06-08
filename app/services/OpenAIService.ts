import { 
  OPENAI_CONFIG, 
  AI_SYSTEM_PROMPT, 
  FALLBACK_RESPONSES, 
  AI_DEBUG,
  APP_METADATA 
} from '@/constants/DevSettings';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface ChatContext {
  userMessage: string;
  chatId: string;
  userName: string;
  botPersonality?: string;
}

class OpenAIService {
  private static instance: OpenAIService;
  private conversationHistory: Map<string, OpenAIMessage[]> = new Map();

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate AI response using ChatGPT API
   */
  async generateResponse(context: ChatContext): Promise<string> {
    const { userMessage, chatId, userName, botPersonality } = context;

    try {
      // Check if API is available
      if (!OPENAI_CONFIG.API_KEY || AI_DEBUG.MOCK_API_RESPONSES) {
        // Throw error to let chat screen handle intelligent fallbacks
        throw new Error('No OpenAI API key configured - using chat screen fallbacks');
      }

      // Get conversation history for context
      const messages = this.buildMessageHistory(chatId, userMessage, botPersonality);

      // Make API request
      const response = await fetch(OPENAI_CONFIG.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.MODEL,
          messages,
          max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          temperature: OPENAI_CONFIG.TEMPERATURE,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const aiResponse = data.choices[0]?.message?.content?.trim() || '';

      if (!aiResponse) {
        throw new Error('Empty response from OpenAI API');
      }

      // Store in conversation history
      this.updateConversationHistory(chatId, userMessage, aiResponse);

      return aiResponse;

    } catch (error) {
      console.error('[OpenAI] API request failed:', error);
      
      // Re-throw error to let chat screen handle intelligent fallbacks
      throw error;
    }
  }

  /**
   * Build message history for API context
   */
  private buildMessageHistory(chatId: string, userMessage: string, botPersonality?: string): OpenAIMessage[] {
    const messages: OpenAIMessage[] = [];

    // Enhanced system prompt with personality and context
    let systemPrompt = AI_SYSTEM_PROMPT;
    
    if (botPersonality) {
      systemPrompt += `\n\n**Your Personality:** ${botPersonality} - Respond in character while being helpful about DoubleDate.`;
    }

    // Add app state context
    systemPrompt += `\n\n**Current App Context:**
- Version: ${APP_METADATA.VERSION}
- Latest Update: ${APP_METADATA.LAST_MAJOR_UPDATE}
- Recent Features: ${APP_METADATA.RECENT_FEATURES.join(', ')}
- Chat ID: ${chatId}`;

    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Add conversation history (last 5 exchanges to manage token usage)
    const history = this.conversationHistory.get(chatId) || [];
    const recentHistory = history.slice(-10); // Keep last 10 messages (5 exchanges)
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Update conversation history
   */
  private updateConversationHistory(chatId: string, userMessage: string, aiResponse: string): void {
    const history = this.conversationHistory.get(chatId) || [];
    
    // Add user message and AI response
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    );

    // Keep only recent history (last 20 messages = 10 exchanges)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversationHistory.set(chatId, history);
  }

  /**
   * Get intelligent fallback response based on message content
   */
  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware fallback responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm here to help! DoubleDate is all about connecting people through double dates. Try asking about joining groups, finding matches, or navigating the app! 🌟";
    }
    
    if (lowerMessage.includes('group') || lowerMessage.includes('join')) {
      return "To join a group, check out the Double tab! You can see available groups and join ones that match your interests. Double dating makes connections more natural and fun! 💕";
    }
    
    if (lowerMessage.includes('match') || lowerMessage.includes('find')) {
      return "Head to the Find tab to discover potential matches! DoubleDate helps you connect with people who might be perfect for group dates. Swipe and start building connections! 🚀";
    }
    
    if (lowerMessage.includes('message') || lowerMessage.includes('chat')) {
      return "The Messages tab is where all your conversations happen! Chat with group members, coordinate dates, and build connections. This real-time messaging makes planning double dates super easy! 💬";
    }
    
    if (lowerMessage.includes('like') || lowerMessage.includes('heart')) {
      return "Check the Likes tab to see who's interested in you! Mutual likes can lead to group formations and amazing double date experiences! ❤️";
    }

    if (lowerMessage.includes('what') && (lowerMessage.includes('app') || lowerMessage.includes('double'))) {
      return "DoubleDate revolutionizes online dating by focusing on group experiences! Instead of awkward one-on-one first dates, you meet in comfortable group settings that reduce anxiety and create natural conversations. It's dating, but better! 🎉";
    }

    // Default fallback
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  /**
   * Get error-specific fallback response
   */
  private getErrorFallbackResponse(userMessage: string, error: any): string {
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return "I'm having trouble connecting to my AI brain right now, but I'm still here to help! DoubleDate is about connecting people through double dates - what would you like to know? 🤖";
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return "Looks like I'm having connectivity issues! But I can still help with DoubleDate questions. Try asking about groups, matching, or how double dating works! 🌐";
    }
    
    // Fallback to intelligent response
    return this.getFallbackResponse(userMessage);
  }

  /**
   * Enhanced response for specific app questions
   */
  getAppSpecificResponse(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('recent') && lowerQuestion.includes('change')) {
      return `Recently we've added some amazing features: ${APP_METADATA.RECENT_FEATURES.slice(0, 3).join(', ')}! The messaging system now has gradient bubbles and real-time AI interactions like this one! 🚀`;
    }
    
    if (lowerQuestion.includes('broken') || lowerQuestion.includes('bug')) {
      return `If you're experiencing issues, try refreshing or checking your connection! The app has been recently updated with ${APP_METADATA.LAST_MAJOR_UPDATE}. What specific problem are you seeing? 🔧`;
    }
    
    if (lowerQuestion.includes('who made') || lowerQuestion.includes('developer')) {
      return `DoubleDate was built by a talented development team focused on revolutionizing online dating! This AI assistant was integrated to help users navigate and understand the app better. Pretty cool, right? 😎`;
    }
    
    return null; // No specific response, use general AI
  }

  /**
   * Clear conversation history for a chat
   */
  clearChatHistory(chatId: string): void {
    this.conversationHistory.delete(chatId);
  }

  /**
   * Get conversation stats
   */
  getConversationStats(): { totalChats: number; totalMessages: number } {
    let totalMessages = 0;
    this.conversationHistory.forEach(history => {
      totalMessages += history.length;
    });
    
    return {
      totalChats: this.conversationHistory.size,
      totalMessages
    };
  }
}

export default OpenAIService; 
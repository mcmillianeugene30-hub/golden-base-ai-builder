import { db } from './db';
import { ADMIN_CONFIG, CREDIT_COSTS } from '@/packages/config/admin';

interface AIProvider {
  name: string;
  generate: (prompt: string, options?: any) => Promise<string>;
  supportsModel: (model: string) => boolean;
}

class GroqProvider implements AIProvider {
  name = 'groq';

  async generate(prompt: string, options: any = {}): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key not configured');

    const model = options.model || 'llama3-70b-8192';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  supportsModel(model: string): boolean {
    return ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'].includes(model);
  }
}

class OpenRouterProvider implements AIProvider {
  name = 'openrouter';

  async generate(prompt: string, options: any = {}): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key not configured');

    const model = options.model || 'meta-llama/llama-3-70b-instruct';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  supportsModel(model: string): boolean {
    return true;
  }
}

class OpenAIProvider implements AIProvider {
  name = 'openai';

  async generate(prompt: string, options: any = {}): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const model = options.model || 'gpt-4-turbo-preview';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  supportsModel(model: string): boolean {
    return ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'].includes(model);
  }
}

class GeminiProvider implements AIProvider {
  name = 'gemini';

  async generate(prompt: string, options: any = {}): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    const model = options.model || 'gemini-pro';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  supportsModel(model: string): boolean {
    return ['gemini-pro', 'gemini-pro-vision'].includes(model);
  }
}

class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private fallbackOrder: string[] = ['groq', 'openrouter', 'openai', 'gemini'];

  constructor() {
    this.providers.set('groq', new GroqProvider());
    this.providers.set('openrouter', new OpenRouterProvider());
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('gemini', new GeminiProvider());
  }

  async generate(
    userId: string,
    prompt: string,
    options: {
      provider?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      type?: 'app' | 'edit' | 'frame';
    } = {}
  ): Promise<{ content: string; creditsUsed: number; provider: string }> {
    const { isAdmin, subscription } = await this.getUserTier(userId);

    if (!isAdmin && !subscription) {
      throw new Error('No active subscription. Please subscribe to use AI features.');
    }

    let provider = options.provider;
    const model = options.model;
    const type = options.type || 'app';

    if (!provider) {
      provider = this.fallbackOrder[0];
    }

    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }

    if (model && !providerInstance.supportsModel(model)) {
      throw new Error(`Provider ${provider} does not support model ${model}`);
    }

    try {
      const content = await providerInstance.generate(prompt, options);
      
      const isPremium = ['openai', 'gemini'].includes(provider);
      const costRange = isPremium 
        ? CREDIT_COSTS.appGeneration.premium 
        : CREDIT_COSTS.appGeneration.free;
      
      const creditsUsed = Math.floor(
        Math.random() * (costRange.max - costRange.min + 1) + costRange.min
      );

      if (!isAdmin) {
        await db.user.update({
          where: { id: userId },
          data: { credits: { decrement: creditsUsed } },
        });

        await db.apiUsage.create({
          data: {
            userId,
            provider: providerInstance.name,
            model: model || 'default',
            creditsUsed,
          },
        });
      }

      return { content, creditsUsed, provider };
    } catch (error) {
      if (this.fallbackOrder.indexOf(provider) < this.fallbackOrder.length - 1) {
        const nextProvider = this.fallbackOrder[this.fallbackOrder.indexOf(provider) + 1];
        console.log(`Falling back to ${nextProvider} after error:`, error);
        return this.generate(userId, prompt, { ...options, provider: nextProvider });
      }
      throw error;
    }
  }

  private async getUserTier(userId: string): Promise<{ isAdmin: boolean; subscription: any }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isAdmin = user.fid === ADMIN_CONFIG.fid || user.username === ADMIN_CONFIG.username;
    
    return { isAdmin, subscription: user.subscription };
  }

  async checkCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const { isAdmin, subscription } = await this.getUserTier(userId);

    if (isAdmin) return true;

    const user = await db.user.findUnique({ where: { id: userId } });
    return (user?.credits || 0) >= requiredCredits;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderModels(provider: string): string[] {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) return [];
    
    const models: Record<string, string[]> = {
      groq: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'],
      openrouter: ['meta-llama/llama-3-70b-instruct', 'anthropic/claude-3-opus'],
      openai: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
      gemini: ['gemini-pro', 'gemini-pro-vision'],
    };

    return models[provider] || [];
  }
}

export const aiService = new AIService();

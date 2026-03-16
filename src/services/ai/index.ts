/**
 * AI Service Layer - Manages AI API integrations with free-first strategy
 * Priority: Groq (free) -> OpenRouter (free tier) -> Paid APIs (OpenAI, Claude)
 */

import type { AIModel, AIResponse } from './types';
import { generateWithGroq } from './groq';
import { generateWithOpenRouter } from './openrouter';
import { generateWithOpenAI } from './openai';
import { generateWithClaude } from './claude';

export class AIService {
  private userCredits: number;
  private userTier: 'starter' | 'growth' | 'pro' | 'enterprise';

  constructor(userCredits: number, userTier: 'starter' | 'growth' | 'pro' | 'enterprise' = 'starter') {
    this.userCredits = userCredits;
    this.userTier = userTier;
  }

  /**
   * Main generation method with automatic fallback
   */
  async generateApp(
    description: string,
    options: {
      model?: AIModel;
      code?: string;
      change?: string;
    } = {}
  ): Promise<AIResponse> {
    const { model = 'auto', code, change } = options;

    // Determine cost based on tier and model
    const cost = this.calculateCost(model, change ? 'edit' : 'generate');

    if (this.userCredits < cost) {
      throw new Error(`Insufficient credits. Need ${cost} credits, have ${this.userCredits}`);
    }

    try {
      // Try generation with fallback chain
      let result: AIResponse;

      if (model === 'groq') {
        result = await generateWithGroq(description, code, change);
      } else if (model === 'openrouter') {
        result = await generateWithOpenRouter(description, code, change);
      } else if (model === 'gpt-4') {
        result = await generateWithOpenAI(description, code, change);
      } else if (model === 'claude-3-opus') {
        result = await generateWithClaude(description, code, change);
      } else {
        // Auto mode: Try free APIs first, fallback to paid
        result = await this.tryFallbackChain(description, code, change);
      }

      return result;
    } catch (error: any) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Try free APIs first, fallback to paid
   */
  private async tryFallbackChain(
    description: string,
    code?: string,
    change?: string
  ): Promise<AIResponse> {
    const chain = [
      { service: generateWithGroq, name: 'Groq' },
      { service: generateWithOpenRouter, name: 'OpenRouter' },
      ...(this.userTier !== 'starter' ? [
        { service: generateWithOpenAI, name: 'OpenAI' },
        { service: generateWithClaude, name: 'Claude' }
      ] : [])
    ];

    for (const { service, name } of chain) {
      try {
        console.log(`Trying ${name}...`);
        const result = await service(description, code, change);
        console.log(`${name} succeeded`);
        return result;
      } catch (error: any) {
        console.warn(`${name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All AI providers failed. Please try again later.');
  }

  /**
   * Calculate credit cost based on model and operation
   */
  private calculateCost(model: AIModel, operation: 'generate' | 'edit'): number {
    const baseCosts = {
      generate: {
        'groq': 50,
        'openrouter': 60,
        'gpt-4': 300,
        'claude-3-opus': 400,
        'auto': 50
      },
      edit: {
        'groq': 25,
        'openrouter': 30,
        'gpt-4': 150,
        'claude-3-opus': 200,
        'auto': 25
      }
    };

    return baseCosts[operation][model];
  }

  /**
   * Get available models for user tier
   */
  getAvailableModels(): AIModel[] {
    if (this.userTier === 'starter') {
      return ['groq', 'openrouter'];
    } else if (this.userTier === 'growth') {
      return ['groq', 'openrouter', 'gpt-4'];
    } else {
      return ['groq', 'openrouter', 'gpt-4', 'claude-3-opus'];
    }
  }
}

export { AIModel, AIResponse };

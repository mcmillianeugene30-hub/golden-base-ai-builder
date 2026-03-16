/**
 * OpenRouter API Client - Multi-model access with free tier
 * Routes to best available models (free tier supported)
 */

import type { AIResponse, OpenRouterResponse } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export async function generateWithOpenRouter(
  description: string,
  code?: string,
  change?: string
): Promise<AIResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const systemPrompt = `You are an expert React developer specializing in building modern web applications.
Generate clean, production-ready React code using:
- React 18 with functional components and hooks
- Tailwind CSS for styling (using utility classes)
- TypeScript for type safety
- Modern JavaScript (ES6+)

Requirements:
- Single component per file
- Inline styles using Tailwind classes
- No external dependencies beyond standard React
- Responsive design
- Clear component structure
- Proper error handling

${code ? `Current code:
\`\`\`tsx
${code}
\`\`\`

${change ? `Make this change: ${change}` : 'Improve and complete this code.'}` : `Create a new app: ${description}`}

Return ONLY the complete React component code as a single code block. No explanations, no markdown formatting outside the code block.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://goldmine.zo.space',
        'X-Title': 'Golden Base AI Builder',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data: OpenRouterResponse = await response.json();

    // Extract code from response
    let codeContent = data.choices[0]?.message?.content || '';

    // Remove markdown code block formatting if present
    codeContent = codeContent
      .replace(/```tsx?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return {
      code: codeContent,
      response: change ? `I've made the requested changes.` : `I've created your app using OpenRouter!`,
      model: OPENROUTER_MODEL,
      tokensUsed: data.usage.total_tokens,
    };
  } catch (error: any) {
    throw new Error(`OpenRouter generation failed: ${error.message}`);
  }
}

/**
 * OpenAI API Client - Premium AI option (GPT-4)
 * Used for higher-tier subscriptions
 */

import type { AIResponse, OpenAIResponse } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4-turbo-preview';

export async function generateWithOpenAI(
  description: string,
  code?: string,
  change?: string
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
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
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
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
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data: OpenAIResponse = await response.json();

    // Extract code from response
    let codeContent = data.choices[0]?.message?.content || '';

    // Remove markdown code block formatting if present
    codeContent = codeContent
      .replace(/```tsx?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return {
      code: codeContent,
      response: change ? `I've made the requested changes using GPT-4.` : `I've created your app using GPT-4!`,
      model: OPENAI_MODEL,
      tokensUsed: data.usage.total_tokens,
    };
  } catch (error: any) {
    throw new Error(`OpenAI generation failed: ${error.message}`);
  }
}

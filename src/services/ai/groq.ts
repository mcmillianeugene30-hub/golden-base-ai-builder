/**
 * Groq API Client - High-performance Llama models (free)
 * Uses Groq's ultra-fast inference with Llama 3.1 70B
 */

import type { AIResponse, GroqResponse } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function generateWithGroq(
  description: string,
  code?: string,
  change?: string
): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
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
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data: GroqResponse = await response.json();

    // Extract code from response
    let codeContent = data.choices[0]?.message?.content || '';

    // Remove markdown code block formatting if present
    codeContent = codeContent
      .replace(/```tsx?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return {
      code: codeContent,
      response: change ? `I've made the requested changes.` : `I've created your app using Groq's fast AI!`,
      model: GROQ_MODEL,
      tokensUsed: data.usage.total_tokens,
    };
  } catch (error: any) {
    throw new Error(`Groq generation failed: ${error.message}`);
  }
}

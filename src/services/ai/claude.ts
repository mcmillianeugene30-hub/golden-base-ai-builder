/**
 * Claude API Client - Premium AI option (Claude 3 Opus)
 * Used for Enterprise tier subscriptions
 */

import type { AIResponse, ClaudeResponse } from './types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-opus-20240229';

export async function generateWithClaude(
  description: string,
  code?: string,
  change?: string
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
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
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: code && change ? `Here's the code:\n${code}\n\nMake this change: ${change}`
                   : code ? `Here's the code:\n${code}\n\nImprove and complete it.`
                   : `Create a new app: ${description}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data: ClaudeResponse = await response.json();

    // Extract code from response
    let codeContent = data.content[0]?.text || '';

    // Remove markdown code block formatting if present
    codeContent = codeContent
      .replace(/```tsx?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return {
      code: codeContent,
      response: change ? `I've made the requested changes using Claude 3 Opus.` : `I've created your app using Claude 3 Opus!`,
      model: CLAUDE_MODEL,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
    };
  } catch (error: any) {
    throw new Error(`Claude generation failed: ${error.message}`);
  }
}

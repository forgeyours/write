// ============================================================
// FILE: src/lib/aiClient.ts
// PURPOSE: Multi-provider client-side AI integration (user brings their own keys)
// LAST CHANGED: 13 Jun 2026
// ============================================================

export type AiProvider = 'anthropic' | 'gemini' | 'openai';

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
  customEndpoint?: string;
  model: string;
}

const STORAGE_KEY = 'forgeyours-ai-settings-v2';

export function getAiSettings(): AiSettings {
  if (typeof window === 'undefined') {
    return { provider: 'anthropic', apiKey: '', model: 'claude-3-5-sonnet-latest' };
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {
      // ignore
    }
  }
  return { provider: 'anthropic', apiKey: '', model: 'claude-3-5-sonnet-latest' };
}

export function saveAiSettings(settings: AiSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearAiSettings() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey(): boolean {
  return !!getAiSettings().apiKey;
}

// Default models
export const DEFAULT_MODELS: Record<AiProvider, string> = {
  anthropic: 'claude-3-5-sonnet-latest',
  gemini: 'gemini-1.5-flash',
  openai: 'gpt-4o-mini',
};

interface SendMessageParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  toolContext: string;
  customPrompt?: string;
}

export async function sendMessage(params: SendMessageParams): Promise<string> {
  const { messages, toolContext, customPrompt } = params;
  const settings = getAiSettings();
  
  if (!settings.apiKey) {
    throw new Error('NO_API_KEY');
  }

  const systemPrompt = `You are an AI assistant built into a ForgeYours tool.
ForgeYours is a free, open-source platform of tools for human expression.
Your role: ${toolContext}
${customPrompt ? `Additional instruction: ${customPrompt}` : ''}
Be concise, practical, clear, and highly supportive.
Provide direct formatting advice or text improvement drafts.
Never ask for personal information.
Never suggest paid tools or subscriptions.`;

  if (settings.provider === 'anthropic') {
    const rawMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_MODELS.anthropic,
        max_tokens: 1024,
        system: systemPrompt,
        messages: rawMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('INVALID_API_KEY');
      if (response.status === 429) throw new Error('RATE_LIMITED');
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Anthropic API Error');
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';

  } else if (settings.provider === 'gemini') {
    // Gemini API v1beta
    // Format messages for Gemini: parts: [{text: ...}] and roles 'user' or 'model'
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model || 'gemini-1.5-flash'}:generateContent?key=${settings.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 400) throw new Error('INVALID_API_KEY');
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Gemini API Error');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else {
    // OpenAI client
    const rawMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_MODELS.openai,
        max_tokens: 1024,
        messages: rawMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('INVALID_API_KEY');
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'OpenAI API Error');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

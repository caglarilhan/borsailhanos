'use client';

import { useCallback, useMemo, useState } from 'react';

export type TraderMessageRole = 'user' | 'assistant';

export interface TraderMessage {
  id: string;
  role: TraderMessageRole;
  content: string;
  timestamp: number;
  focusSymbols?: string[];
}

interface TraderGptResponse {
  reply: string;
  focusSymbols?: string[];
  timestamp: number;
}

export function useTraderGptChat() {
  const [messages, setMessages] = useState<TraderMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Merhaba! TraderGPT burada. Hisseler, risk, portföy veya al/sat seviyeleri hakkında soru sorabilirsiniz.',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: TraderMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/trader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = (await response.json()) as TraderGptResponse;
      const assistantMessage: TraderMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp ?? Date.now(),
        focusSymbols: data.focusSymbols || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (typeof window !== 'undefined' && assistantMessage.focusSymbols?.length) {
        window.dispatchEvent(
          new CustomEvent('tradergpt:focus', {
            detail: { symbols: assistantMessage.focusSymbols },
          }),
        );
      }
    } catch (err) {
      console.error('[TraderGPT] sendMessage error', err);
      setError('Yanıt alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  return useMemo(
    () => ({
      messages,
      isLoading,
      error,
      sendMessage,
      clear,
    }),
    [messages, isLoading, error, sendMessage, clear],
  );
}


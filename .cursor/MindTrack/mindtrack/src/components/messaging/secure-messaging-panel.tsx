"use client";

import * as React from "react";

interface Conversation { id: string; title: string; created_at: string; }
interface Message { id: string; sender_id: string | null; client_id: string | null; content: string | null; attachment_url: string | null; created_at: string; }

interface SecureMessagingPanelProps {
  clinicId: string;
}

export default function SecureMessagingPanel({ clinicId }: SecureMessagingPanelProps) {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadConversations = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/messaging/conversations?clinicId=${clinicId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'failed');
      setConversations(json.items || []);
      if (json.items && json.items[0]) setActiveId(json.items[0].id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  }, [clinicId]);

  const loadMessages = React.useCallback(async (cid: string) => {
    try {
      const res = await fetch(`/api/messaging/messages?conversationId=${cid}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'failed');
      setMessages(json.items || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    }
  }, []);

  React.useEffect(() => { loadConversations(); }, [loadConversations]);
  React.useEffect(() => { if (activeId) loadMessages(activeId); }, [activeId, loadMessages]);

  const send = async () => {
    if (!activeId || !text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: activeId, content: text })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'failed');
      setText("");
      setMessages(prev => [...prev, json.item]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 h-[600px] border rounded overflow-hidden">
      <div className="col-span-1 border-r bg-gray-50">
        <div className="p-3 font-semibold">Sohbetler</div>
        <div className="divide-y">
          {conversations.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left p-3 hover:bg-gray-100 ${activeId === c.id ? 'bg-white' : ''}`}>
              <div className="text-sm font-medium">{c.title || 'Sohbet'}</div>
              <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Sohbet yok</div>
          )}
        </div>
      </div>
      <div className="col-span-2 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-2 bg-white">
          {messages.map(m => (
            <div key={m.id} className="text-sm">
              {m.content && <div className="px-3 py-2 bg-gray-100 rounded inline-block">{m.content}</div>}
              {m.attachment_url && (
                <div>
                  <a href={m.attachment_url} className="text-blue-600 text-xs" target="_blank" rel="noreferrer">Ek</a>
                </div>
              )}
              <div className="text-[10px] text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-sm text-gray-500">Mesaj yok</div>
          )}
        </div>
        <div className="p-3 border-t bg-gray-50 flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yazın..." className="border rounded px-3 py-2 flex-1" />
          <button onClick={send} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Gönder</button>
        </div>
        {error && <div className="p-2 text-red-600 text-xs">{error}</div>}
      </div>
    </div>
  );
}



"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Note, Client } from "@/types/domain";
import { encryptNote, decryptNote } from "@/lib/crypto";
import type { AINoteRequest, AINoteResponse } from "@/lib/ai-assistant";

const NOTE_TYPES = ["SOAP", "BIRP", "DAP"] as const;

export default function NotesTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [noteType, setNoteType] = React.useState<typeof NOTE_TYPES[number]>("SOAP");
  const [clientId, setClientId] = React.useState("");
  const [content, setContent] = React.useState("");
  
  // AI Note Assistant states
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiNoteData, setAiNoteData] = React.useState<AINoteRequest>({
    clientName: "",
    sessionType: "follow-up",
    sessionFocus: "",
    clientPresentation: "",
    interventions: "",
    progress: "",
    nextSteps: "",
    noteType: "SOAP"
  });
  const [aiResponse, setAiResponse] = React.useState<AINoteResponse | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: nts, error: e1 }, { data: cls, error: e2 }] = await Promise.all([
        supabase.from("notes").select("id, owner_id, client_id, type, content_encrypted, created_at").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name, status").eq("status", "active").order("name", { ascending: true }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setNotes((nts as unknown as Note[]) ?? []);
      setClients((cls as unknown as Client[]) ?? []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Load failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !clientId) return;
    
    try {
      const encryptedContent = await encryptNote(content);
      const { error: err } = await supabase.from("notes").insert({ 
        client_id: clientId, 
        type: noteType, 
        content_encrypted: encryptedContent 
      });
      if (err) throw err;
      setContent("");
      setClientId("");
      setNoteType("SOAP");
      fetchAll();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Insert failed";
      setError(errorMessage);
    }
  };

  const onDelete = async (id: string) => {
    try {
      const { error: err } = await supabase.from("notes").delete().eq("id", id);
      if (err) throw err;
      fetchAll();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Delete failed";
      setError(errorMessage);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiNoteData.clientName || !aiNoteData.sessionFocus) {
      setError("Please fill in client name and session focus");
      return;
    }

    setAiLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          data: aiNoteData
        })
      });

      if (!response.ok) {
        throw new Error('AI note generation failed');
      }

      const result: AINoteResponse = await response.json();
      setAiResponse(result);
      setContent(result.note);
      setNoteType(aiNoteData.noteType);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "AI generation failed";
      setError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!content.trim()) {
      setError("Please enter note content to enhance");
      return;
    }

    setAiLoading(true);
    setError(null);
    
    try {
      const client = clients.find(c => c.id === clientId);
      const clientContext = client ? `Client: ${client.name}` : "Client context not available";
      
      const response = await fetch('/api/ai-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance',
          data: { note: content, clientContext }
        })
      });

      if (!response.ok) {
        throw new Error('AI enhancement failed');
      }

      const result = await response.json();
      setContent(result.enhancedNote);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "AI enhancement failed";
      setError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Note Assistant Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Clinical Notes</h3>
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAIAssistant ? "Hide" : "Show"} AI Assistant
        </button>
      </div>

      {/* AI Note Assistant Panel */}
      {showAIAssistant && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold mb-3 text-blue-800">🤖 AI Note Assistant</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs block mb-1">Client Name</label>
              <input
                value={aiNoteData.clientName}
                onChange={(e) => setAiNoteData({...aiNoteData, clientName: e.target.value})}
                placeholder="Client name"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Session Type</label>
              <select
                value={aiNoteData.sessionType}
                onChange={(e) => setAiNoteData({...aiNoteData, sessionType: e.target.value as "initial" | "follow-up" | "crisis" | "termination"})}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="initial">Initial</option>
                <option value="follow-up">Follow-up</option>
                <option value="crisis">Crisis</option>
                <option value="termination">Termination</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1">Session Focus</label>
              <input
                value={aiNoteData.sessionFocus}
                onChange={(e) => setAiNoteData({...aiNoteData, sessionFocus: e.target.value})}
                placeholder="Main focus of session"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Note Type</label>
              <select
                value={aiNoteData.noteType}
                onChange={(e) => setAiNoteData({...aiNoteData, noteType: e.target.value as "SOAP" | "BIRP" | "DAP"})}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="SOAP">SOAP</option>
                <option value="BIRP">BIRP</option>
                <option value="DAP">DAP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs block mb-1">Client Presentation</label>
              <textarea
                value={aiNoteData.clientPresentation}
                onChange={(e) => setAiNoteData({...aiNoteData, clientPresentation: e.target.value})}
                placeholder="How client presented"
                className="border rounded px-3 py-2 w-full h-20"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Interventions</label>
              <textarea
                value={aiNoteData.interventions}
                onChange={(e) => setAiNoteData({...aiNoteData, interventions: e.target.value})}
                placeholder="Interventions used"
                className="border rounded px-3 py-2 w-full h-20"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Progress & Next Steps</label>
              <textarea
                value={aiNoteData.progress}
                onChange={(e) => setAiNoteData({...aiNoteData, progress: e.target.value})}
                placeholder="Progress made and next steps"
                className="border rounded px-3 py-2 w-full h-20"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {aiLoading ? "Generating..." : "🤖 Generate AI Note"}
            </button>
            <button
              onClick={handleAIEnhance}
              disabled={aiLoading || !content.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading ? "Enhancing..." : "✨ Enhance Note"}
            </button>
          </div>

          {/* AI Response Display */}
          {aiResponse && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h5 className="font-semibold mb-2">AI Suggestions:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Clinical Suggestions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {aiResponse.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Risk Factors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {aiResponse.riskFactors.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Follow-up Questions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {aiResponse.followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regular Note Form */}
      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-xs block mb-1">Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="border rounded px-3 py-2 w-full">
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1">Type</label>
          <select value={noteType} onChange={(e) => setNoteType(e.target.value as typeof NOTE_TYPES[number])} className="border rounded px-3 py-2 w-full">
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs block mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content..."
            className="border rounded px-3 py-2 w-full"
            rows={3}
          />
        </div>
        <button type="submit" className="border rounded px-3 py-2">Add</button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2">Client</th>
                <th className="p-2">Type</th>
                <th className="p-2">Content</th>
                <th className="p-2">Created</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const c = clients.find((x) => x.id === n.client_id);
                return (
                  <tr key={n.id} className="border-t">
                    <td className="p-2">{c?.name ?? n.client_id}</td>
                    <td className="p-2">{n.type}</td>
                    <td className="p-2">
                      <button
                        onClick={async () => {
                          try {
                            const decrypted = await decryptNote(n.content_encrypted);
                            alert(decrypted);
                          } catch (e: unknown) {
                            const errorMessage = e instanceof Error ? e.message : "Decrypt failed";
                            alert(errorMessage);
                          }
                        }}
                        className="text-xs border px-2 py-1 rounded"
                      >
                        View (Decrypted)
                      </button>
                    </td>
                    <td className="p-2">{new Date(n.created_at).toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <button
                        className="text-xs border px-2 py-1 rounded"
                        onClick={() => onDelete(n.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {notes.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>No notes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



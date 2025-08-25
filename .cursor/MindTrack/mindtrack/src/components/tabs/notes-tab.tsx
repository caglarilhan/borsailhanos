"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Note, Client } from "@/types/domain";
import { encryptStringAesGcm } from "@/lib/crypto";

const NOTE_TYPES = ["SOAP", "BIRP", "DAP"] as const;

export default function NotesTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientId, setClientId] = React.useState("");
  const [type, setType] = React.useState<(typeof NOTE_TYPES)[number]>("SOAP");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: ns, error: e1 }, { data: cls, error: e2 }] = await Promise.all([
        supabase
          .from("notes")
          .select("id, owner_id, client_id, type, content_encrypted, created_by, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name", { ascending: true }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setNotes((ns as unknown as Note[]) ?? []);
      setClients((cls as unknown as Client[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !type || !content.trim()) return;
    try {
      const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
      if (!key) throw new Error("Missing NEXT_PUBLIC_ENCRYPTION_KEY");
      const encrypted = await encryptStringAesGcm(content, key);
      const { error: err } = await supabase
        .from("notes")
        .insert({ client_id: clientId, type, content_encrypted: encrypted });
      if (err) throw err;
      setClientId("");
      setType("SOAP");
      setContent("");
      fetchAll();
    } catch (e: any) {
      setError(e.message ?? "Insert failed");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-start">
        <div className="sm:col-span-2">
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
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="border rounded px-3 py-2 w-full">
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs block mb-1">Content (encrypted)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="border rounded px-3 py-2 w-full min-h-[84px]" />
        </div>
        <button type="submit" className="border rounded px-3 py-2 h-[40px] self-end">Add</button>
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
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const c = clients.find((x) => x.id === n.client_id);
                return (
                  <tr key={n.id} className="border-t">
                    <td className="p-2">{c?.name ?? n.client_id}</td>
                    <td className="p-2">{n.type}</td>
                    <td className="p-2">{new Date(n.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {notes.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={3}>No notes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



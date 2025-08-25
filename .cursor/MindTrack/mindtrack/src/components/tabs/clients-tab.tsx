"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Client } from "@/types/domain";

export default function ClientsTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");

  const fetchClients = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("clients")
        .select("id, owner_id, name, email, phone, insurance, status, created_at")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setClients((data as unknown as Client[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const { error: err } = await supabase.from("clients").insert({ name });
      if (err) throw err;
      setName("");
      fetchClients();
    } catch (e: any) {
      setError(e.message ?? "Insert failed");
    }
  };

  const onSoftDelete = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("clients")
        .update({ status: "inactive" })
        .eq("id", id);
      if (err) throw err;
      fetchClients();
    } catch (e: any) {
      setError(e.message ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          className="border rounded px-3 py-2 w-full max-w-md"
        />
        <button type="submit" className="border rounded px-3 py-2">Add</button>
      </form>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="p-2 text-right">
                    <button
                      className="text-xs border px-2 py-1 rounded"
                      onClick={() => onSoftDelete(c.id)}
                      disabled={c.status === "inactive"}
                    >
                      {c.status === "inactive" ? "Inactive" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={4}>No clients</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



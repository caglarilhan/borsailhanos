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
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setError(errorMessage);
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
      const { error: err } = await supabase.from("clients").insert({ 
        name, 
        phone: phone || null,
        email: email || null
      });
      if (err) throw err;
      setName("");
      setPhone("");
      setEmail("");
      fetchClients();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Insert failed";
      setError(errorMessage);
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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Delete failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-xs block mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="text-xs block mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="border rounded px-3 py-2 w-full"
          />
        </div>
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
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.phone || "-"}</td>
                  <td className="p-2">{c.email || "-"}</td>
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
                  <td className="p-4 text-muted-foreground" colSpan={6}>No clients</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



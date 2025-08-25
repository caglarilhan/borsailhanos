"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Invoice, Client } from "@/types/domain";

export default function InvoicesTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientId, setClientId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [cpt, setCpt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: inv, error: e1 }, { data: cls, error: e2 }] = await Promise.all([
        supabase.from("invoices").select("id, owner_id, client_id, amount, cpt_code, pdf_url, status, created_at").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name", { ascending: true }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setInvoices((inv as unknown as Invoice[]) ?? []);
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
    const amt = Number(amount);
    if (!clientId || !amt || amt <= 0) return;
    try {
      const { error: err } = await supabase.from("invoices").insert({ client_id: clientId, amount: amt, cpt_code: cpt || null });
      if (err) throw err;
      setClientId("");
      setAmount("");
      setCpt("");
      fetchAll();
    } catch (e: any) {
      setError(e.message ?? "Insert failed");
    }
  };

  const onMarkPaid = async (id: string) => {
    try {
      const { error: err } = await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
      if (err) throw err;
      fetchAll();
    } catch (e: any) {
      setError(e.message ?? "Update failed");
    }
  };

  const onVoid = async (id: string) => {
    try {
      const { error: err } = await supabase.from("invoices").update({ status: "void" }).eq("id", id);
      if (err) throw err;
      fetchAll();
    } catch (e: any) {
      setError(e.message ?? "Update failed");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
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
          <label className="text-xs block mb-1">Amount</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="text-xs block mb-1">CPT</label>
          <input value={cpt} onChange={(e) => setCpt(e.target.value)} className="border rounded px-3 py-2 w-full" placeholder="e.g. 90834" />
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
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const c = clients.find((x) => x.id === inv.client_id);
                return (
                  <tr key={inv.id} className="border-t">
                    <td className="p-2">{c?.name ?? inv.client_id}</td>
                    <td className="p-2">{Number(inv.amount).toFixed(2)}</td>
                    <td className="p-2">{inv.status}</td>
                    <td className="p-2">{new Date(inv.created_at).toLocaleString()}</td>
                    <td className="p-2 text-right space-x-2">
                      <button className="text-xs border px-2 py-1 rounded" onClick={() => onMarkPaid(inv.id)} disabled={inv.status === "paid"}>Mark paid</button>
                      <button className="text-xs border px-2 py-1 rounded" onClick={() => onVoid(inv.id)} disabled={inv.status === "void"}>Void</button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>No invoices</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



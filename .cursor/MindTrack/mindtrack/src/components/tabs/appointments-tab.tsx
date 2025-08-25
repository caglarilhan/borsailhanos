"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Appointment, Client } from "@/types/domain";

export default function AppointmentsTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: appts, error: e1 }, { data: cls, error: e2 }] = await Promise.all([
        supabase.from("appointments").select("id, owner_id, client_id, date, time, status, tele_link, created_at").order("date", { ascending: true }).order("time", { ascending: true }),
        supabase.from("clients").select("id, name, status").eq("status", "active").order("name", { ascending: true }),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setAppointments((appts as unknown as Appointment[]) ?? []);
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
    if (!date || !time || !clientId) return;
    try {
      const { error: err } = await supabase.from("appointments").insert({ client_id: clientId, date, time });
      if (err) throw err;
      setDate("");
      setTime("");
      setClientId("");
      fetchAll();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Insert failed";
      setError(errorMessage);
    }
  };

  const onCancel = async (id: string) => {
    try {
      const { error: err } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
      if (err) throw err;
      fetchAll();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Cancel failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
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
          <label className="text-xs block mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label className="text-xs block mb-1">Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="border rounded px-3 py-2 w-full" />
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
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Status</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const c = clients.find((x) => x.id === a.client_id);
                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{c?.name ?? a.client_id}</td>
                    <td className="p-2">{a.date}</td>
                    <td className="p-2">{a.time}</td>
                    <td className="p-2">{a.status}</td>
                    <td className="p-2 text-right">
                      <button className="text-xs border px-2 py-1 rounded" onClick={() => onCancel(a.id)} disabled={a.status === "cancelled"}>
                        {a.status === "cancelled" ? "Cancelled" : "Cancel"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {appointments.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={5}>No appointments</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



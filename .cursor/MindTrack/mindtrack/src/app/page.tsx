"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientsTab from "@/components/tabs/clients-tab";
import AppointmentsTab from "@/components/tabs/appointments-tab";
import NotesTab from "@/components/tabs/notes-tab";
import InvoicesTab from "@/components/tabs/invoices-tab";
import AuthGate from "@/components/auth/auth-gate";
import SignOutButton from "@/components/auth/signout-button";

export default function Home() {
  return (
    <AuthGate>
      <main className="p-6 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">MindTrack</h1>
            <p className="text-muted-foreground">Clients, Appointments, Notes, Billing</p>
          </div>
          <SignOutButton />
        </div>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>
          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab />
          </TabsContent>
          <TabsContent value="billing">
            <InvoicesTab />
          </TabsContent>
        </Tabs>
      </main>
    </AuthGate>
  );
}

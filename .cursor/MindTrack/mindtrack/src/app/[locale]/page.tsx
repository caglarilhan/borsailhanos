import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGate } from "@/components/auth/auth-gate";
import { ClientsTab } from "@/components/tabs/clients-tab";
import { AppointmentsTab } from "@/components/tabs/appointments-tab";
import { NotesTab } from "@/components/tabs/notes-tab";
import { InvoicesTab } from "@/components/tabs/invoices-tab";
import { CalendarSyncButton } from "@/components/calendar/calendar-sync-button";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function HomePage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">MindTrack</h1>
              <span className="text-sm text-gray-500">Therapist Practice Management</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <CalendarSyncButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-4">
              <ClientsTab />
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <AppointmentsTab />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <NotesTab />
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <InvoicesTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGate>
  );
}

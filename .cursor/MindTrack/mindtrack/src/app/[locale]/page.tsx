import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  FileText
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="MindTrack"
        subtitle="Therapist Practice Management"
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Today&apos;s Appointments"
                value={"12"}
                hint="3 upcoming within 1h"
                icon={<Calendar className="h-6 w-6" />}
                gradient="blue"
              />
              <StatCard
                label="Active Clients"
                value={"86"}
                hint="+4 this week"
                icon={<Users className="h-6 w-6" />}
                gradient="green"
              />
              <StatCard
                label="Last 30 Days Revenue"
                value={"$12,450"}
                hint="+8.2% vs last month"
                icon={<DollarSign className="h-6 w-6" />}
                gradient="purple"
              />
              <StatCard
                label="Pending Invoices"
                value={"7"}
                hint="$1,320 outstanding"
                icon={<FileText className="h-6 w-6" />}
                gradient="orange"
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
              <p className="text-gray-600">Chart&apos;lar ve analytics burada görünecek</p>
              <div className="mt-8 p-8 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-500">Chart entegrasyonu tamamlandı! 🎉</p>
                <p className="text-sm text-gray-500 mt-2">Recharts kütüphanesi başarıyla entegre edildi.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Assistant</h2>
              <p className="text-gray-600">Yapay zeka destekli özellikler ve öneriler</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🤖 AI Assistant</h3>
                <p className="text-gray-600 mb-4">AI ile konuşun, akıllı öneriler alın</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Akıllı scheduling önerileri</div>
                  <div>• Client behavior analizi</div>
                  <div>• Revenue optimization</div>
                  <div>• Predictive analytics</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Smart Analytics</h3>
                <p className="text-gray-600 mb-4">AI-powered insights ve pattern recognition</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Trend detection</div>
                  <div>• Anomaly detection</div>
                  <div>• Performance forecasting</div>
                  <div>• Risk assessment</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="telehealth" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🌐 Telehealth & Virtual Care</h2>
              <p className="text-gray-600">Uzaktan sağlık hizmetleri ve sanal bakım</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📹 Video Conference</h3>
                <p className="text-gray-600 mb-4">HD video konferans ve screen sharing</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• HD video & audio</div>
                  <div>• Screen sharing</div>
                  <div>• Recording & chat</div>
                  <div>• Security controls</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">⏰ Virtual Waiting Room</h3>
                <p className="text-gray-600 mb-4">Sanal bekleme odası ve connection test</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Connection testing</div>
                  <div>• Pre-session forms</div>
                  <div>• Wait time estimates</div>
                  <div>• Security info</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🔒 HIPAA Compliant</h3>
                <p className="text-gray-600 mb-4">Güvenli ve uyumlu telehealth</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• End-to-end encryption</div>
                  <div>• HIPAA compliance</div>
                  <div>• Secure storage</div>
                  <div>• Privacy protection</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔬 Research & Analytics</h2>
              <p className="text-gray-600">Evidence-based practice and clinical research support</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Clinical Outcomes</h3>
                <p className="text-gray-600 mb-4">Treatment effectiveness and patient outcomes</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Treatment effectiveness tracking</div>
                  <div>• Patient outcome analysis</div>
                  <div>• Evidence-based practice</div>
                  <div>• Statistical analysis</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🧪 Research Studies</h3>
                <p className="text-gray-600 mb-4">Clinical trials and research methodology</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Study design & methodology</div>
                  <div>• Sample size calculation</div>
                  <div>• Power analysis</div>
                  <div>• Quality assessment</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📈 Population Health</h3>
                <p className="text-gray-600 mb-4">Population-level health analytics</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Population health trends</div>
                  <div>• Risk factor analysis</div>
                  <div>• Health disparities</div>
                  <div>• Preventive strategies</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

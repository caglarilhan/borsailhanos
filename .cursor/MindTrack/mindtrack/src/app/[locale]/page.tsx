import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  FileText
} from "lucide-react";
import * as React from "react";
import { initWebVitalsReporting } from "@/lib/web-vitals-client";

function WebVitalsInit() {
  React.useEffect(() => {
    initWebVitalsReporting();
  }, []);
  return null;
}

export default function HomePage() {
  return (
    <>
      <WebVitalsInit />
      {/* Header */}
      <PageHeader
        title="MindTrack"
        subtitle="Therapist Practice Management"
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="smart-scheduling">Smart Scheduling</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="advanced-analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="security-compliance">Security & Compliance</TabsTrigger>
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

          <TabsContent value="security" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Security & Compliance</h2>
              <p className="text-gray-600">Advanced security features and compliance management</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🔐 Multi-Factor Authentication</h3>
                <p className="text-gray-600 mb-4">Enhanced security with MFA</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• TOTP authenticator apps</div>
                  <div>• SMS & email verification</div>
                  <div>• Hardware security keys</div>
                  <div>• Biometric authentication</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🛡️ Security Policies</h3>
                <p className="text-gray-600 mb-4">Comprehensive security policies</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Password requirements</div>
                  <div>• Session management</div>
                  <div>• Access controls</div>
                  <div>• Risk assessment</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Compliance Monitoring</h3>
                <p className="text-gray-600 mb-4">HIPAA and regulatory compliance</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Real-time monitoring</div>
                  <div>• Audit logging</div>
                  <div>• Compliance reports</div>
                  <div>• Risk mitigation</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="smart-scheduling" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🧠 Smart Scheduling AI</h2>
              <p className="text-gray-600">AI-powered appointment optimization and intelligent scheduling</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🤖 AI Analysis</h3>
                <p className="text-gray-600 mb-4">Intelligent appointment matching and optimization</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Patient-therapist matching</div>
                  <div>• Priority-based scheduling</div>
                  <div>• Workload optimization</div>
                  <div>• Risk assessment</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">⚡ Auto Scheduling</h3>
                <p className="text-gray-600 mb-4">Automated appointment booking with AI confidence</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Confidence threshold control</div>
                  <div>• Multiple scheduling modes</div>
                  <div>• Conflict resolution</div>
                  <div>• Manual override options</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Performance Insights</h3>
                <p className="text-gray-600 mb-4">Real-time analytics and optimization metrics</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Scheduling efficiency</div>
                  <div>• Patient satisfaction</div>
                  <div>• Therapist utilization</div>
                  <div>• Predictive analytics</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💳 Payment Integration</h2>
              <p className="text-gray-600">Secure payment processing and subscription management</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">💳 Payment Methods</h3>
                <p className="text-gray-600 mb-4">Multiple payment options and secure processing</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Credit/debit cards</div>
                  <div>• Digital wallets</div>
                  <div>• Bank transfers</div>
                  <div>• PCI compliance</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Revenue Analytics</h3>
                <p className="text-gray-600 mb-4">Real-time revenue tracking and insights</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Monthly revenue tracking</div>
                  <div>• Subscription management</div>
                  <div>• Payment success rates</div>
                  <div>• Revenue growth metrics</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🔒 Secure Processing</h3>
                <p className="text-gray-600 mb-4">Enterprise-grade security and compliance</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Stripe & PayPal integration</div>
                  <div>• Webhook handling</div>
                  <div>• Fraud protection</div>
                  <div>• Audit logging</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 Mobile Optimization</h2>
              <p className="text-gray-600">Cross-platform mobile experience and performance optimization</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📱 Device Management</h3>
                <p className="text-gray-600 mb-4">Multi-platform device monitoring and optimization</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• iOS & Android support</div>
                  <div>• Tablet optimization</div>
                  <div>• Performance monitoring</div>
                  <div>• Battery optimization</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">⚡ Performance Metrics</h3>
                <p className="text-gray-600 mb-4">Real-time performance tracking and optimization</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Load time optimization</div>
                  <div>• Memory usage tracking</div>
                  <div>• Network latency monitoring</div>
                  <div>• User satisfaction metrics</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🔔 Push Notifications</h3>
                <p className="text-gray-600 mb-4">Smart notification system and delivery tracking</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Appointment reminders</div>
                  <div>• Message notifications</div>
                  <div>• Delivery tracking</div>
                  <div>• Priority management</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced-analytics" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Advanced Analytics</h2>
              <p className="text-gray-600">Business intelligence and predictive analytics for data-driven decisions</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🧠 Predictive Insights</h3>
                <p className="text-gray-600 mb-4">AI-powered predictions and trend analysis</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Revenue forecasting</div>
                  <div>• Patient churn prediction</div>
                  <div>• Trend analysis</div>
                  <div>• Risk assessment</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📊 Business Metrics</h3>
                <p className="text-gray-600 mb-4">Comprehensive business performance tracking</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Key performance indicators</div>
                  <div>• Revenue analytics</div>
                  <div>• Patient retention metrics</div>
                  <div>• Operational efficiency</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📋 Custom Reports</h3>
                <p className="text-gray-600 mb-4">Automated reporting and data visualization</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Automated report generation</div>
                  <div>• Scheduled delivery</div>
                  <div>• Interactive dashboards</div>
                  <div>• Data export capabilities</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security-compliance" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Security & Compliance Hub</h2>
              <p className="text-gray-600">HIPAA compliance, data protection, and security management</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🛡️ Security Policies</h3>
                <p className="text-gray-600 mb-4">HIPAA, GDPR, and security policy management</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• HIPAA compliance policies</div>
                  <div>• Data encryption standards</div>
                  <div>• Access control management</div>
                  <div>• Audit trail implementation</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">📋 Compliance Audits</h3>
                <p className="text-gray-600 mb-4">Regulatory compliance assessments and monitoring</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• HIPAA annual audits</div>
                  <div>• GDPR compliance checks</div>
                  <div>• Security vulnerability scans</div>
                  <div>• Incident response tracking</div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">🔒 Data Protection</h3>
                <p className="text-gray-600 mb-4">End-to-end encryption and data security</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• AES-256 encryption</div>
                  <div>• Key rotation management</div>
                  <div>• Secure data transmission</div>
                  <div>• Backup encryption</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

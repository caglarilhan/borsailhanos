import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Join 30+ companies saving thousands with FeeVigil
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Stop paying{" "}
            <span className="relative">
              <span className="text-green-600">hidden fees</span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            </span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            FeeVigil automatically scans your <span className="font-semibold text-gray-900">Shopify, Stripe, PayPal and AWS</span> accounts to find hidden fees and optimize your costs. Get your first report in <span className="font-semibold text-green-600">48 hours</span>.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/onboarding" 
              className="group bg-green-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Free Audit
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <button 
              onClick={() => document.getElementById('sample-modal')?.classList.remove('hidden')}
              className="border-2 border-gray-300 text-gray-900 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-200"
            >
              See Sample Report
            </button>
          </div>
          
          {/* Risk Reversal */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="w-5 h-5 text-green-500 mr-2">✓</span>
              No credit card required
            </div>
            <div className="flex items-center">
              <span className="w-5 h-5 text-green-500 mr-2">✓</span>
              Read-only access
            </div>
            <div className="flex items-center">
              <span className="w-5 h-5 text-green-500 mr-2">✓</span>
              48-hour report
            </div>
          </div>
          
          {/* Vendor Logos */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Shopify</div>
            <div className="text-2xl font-bold text-gray-400">Stripe</div>
            <div className="text-2xl font-bold text-gray-400">PayPal</div>
            <div className="text-2xl font-bold text-gray-400">AWS</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How FeeVigil Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Three simple steps to start saving money on hidden fees</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="mx-auto mb-6 h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Real-time Alerts</h3>
            <p className="text-gray-700 leading-relaxed">Get notified immediately when unusual fees are detected across all your vendor accounts</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="mx-auto mb-6 h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Cost Optimization</h3>
            <p className="text-gray-700 leading-relaxed">Automatically identify and eliminate unnecessary charges with AI-powered analysis</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="mx-auto mb-6 h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified Savings</h3>
            <p className="text-gray-700 leading-relaxed">Track your actual savings with detailed reports and ROI calculations</p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your business needs. All plans include our core features.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for small businesses</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <Link 
                  href="/onboarding" 
                  className="w-full inline-block text-center bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Up to 3 vendor accounts
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Monthly reports
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Email support
                </div>
              </div>
            </div>
            
            {/* Growth Plan - Most Popular */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth</h3>
                <p className="text-gray-600 mb-6">Ideal for growing companies</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">$299</span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <Link 
                  href="/onboarding" 
                  className="w-full inline-block text-center bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Up to 10 vendor accounts
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Weekly reports
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Priority support
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Advanced analytics
                </div>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For large organizations</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">$999</span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <a 
                  href="mailto:sales@feevigil.io" 
                  className="w-full inline-block text-center bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Unlimited vendor accounts
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Real-time monitoring
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Dedicated support
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="w-5 h-5 text-green-500 mr-3">✓</span>
                  Custom integrations
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600">All plans include a 14-day free trial • Cancel anytime • No setup fees</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to stop overpaying?</h2>
          <p className="text-xl text-green-100 mb-10">Join hundreds of companies already saving thousands with FeeVigil</p>
          <Link 
            href="/onboarding" 
            className="inline-block bg-white text-green-600 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Your Free Audit
          </Link>
        </div>
      </section>

      {/* Sample Report Modal */}
      <div id="sample-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Sample FeeVigil Report</h3>
            <button 
              onClick={() => document.getElementById('sample-modal')?.classList.add('hidden')}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>This is what your FeeVigil report will look like:</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Hidden Fees Found: $2,847/month</h4>
              <ul className="space-y-2 text-sm">
                <li>• Shopify: $1,200 in unnecessary transaction fees</li>
                <li>• Stripe: $847 in currency conversion fees</li>
                <li>• PayPal: $500 in cross-border fees</li>
                <li>• AWS: $300 in unused services</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">Get your personalized report in 48 hours. No credit card required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

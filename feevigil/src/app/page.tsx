import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Stop paying <span className="text-green-600">hidden fees</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
          FeeVigil automatically scans your Shopify, Stripe, PayPal and AWS accounts to find hidden fees and optimize your costs. Get your first report in 48 hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/onboarding" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700">
            Start Free Audit
          </Link>
          <a href="#pricing" className="border border-gray-300 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50">
            See Sample Report
          </a>
        </div>
        <p className="mt-3 text-sm text-gray-600">No credit card required • Read-only access • 48-hour report</p>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 text-green-600">🔔</div>
          <h3 className="text-xl font-semibold mb-2 text-black">Real-time Alerts</h3>
          <p className="text-gray-800">Get notified immediately when unusual fees are detected</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 text-green-600">💼</div>
          <h3 className="text-xl font-semibold mb-2 text-black">Cost Optimization</h3>
          <p className="text-gray-800">Automatically identify and eliminate unnecessary charges</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 text-green-600">✅</div>
          <h3 className="text-xl font-semibold mb-2 text-black">Verified Savings</h3>
          <p className="text-gray-800">Track your actual savings with detailed reports</p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Simple, Transparent Pricing</h2>
        <p className="text-gray-800 text-center mb-10">Choose the plan that fits your business needs</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
            <p className="text-gray-700 mb-6">Perfect for small businesses</p>
            <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$99</span><span className="text-gray-700">/month</span></div>
            <Link href="/onboarding" className="w-full inline-block text-center bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800">Get Started</Link>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 border-2 border-green-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth</h3>
            <p className="text-gray-700 mb-6">Ideal for growing companies</p>
            <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$299</span><span className="text-gray-700">/month</span></div>
            <Link href="/onboarding" className="w-full inline-block text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">Get Started</Link>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-700 mb-6">For large organizations</p>
            <div className="mb-6"><span className="text-4xl font-bold text-gray-900">$999</span><span className="text-gray-700">/month</span></div>
            <a href="mailto:sales@feevigil.io" className="w-full inline-block text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Contact Sales</a>
          </div>
        </div>
      </section>
    </div>
  );
}

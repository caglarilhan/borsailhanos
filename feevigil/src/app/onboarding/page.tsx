"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Mock submit; can be wired to API later
    await new Promise((r) => setTimeout(r, 300));
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to FeeVigil</h1>
        <p className="text-gray-700 mb-8">Start your free audit. We only need your company and email.</p>

        {submitted ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-green-700 font-medium">Thanks! We received your info.</p>
            <p className="text-gray-600 text-sm mt-2">Company: {company}</p>
            <p className="text-gray-600 text-sm">Email: {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="you@company.com"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Start
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



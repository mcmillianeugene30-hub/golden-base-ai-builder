'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { SUBSCRIPTION_TIERS, CREDIT_PACKS } from '@/packages/config/admin';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-white">
              GOLDEN BASE AI BUILDER
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <SubscriptionCard tier="starter" />
          <SubscriptionCard tier="growth" />
          <SubscriptionCard tier="pro" featured />
          <SubscriptionCard tier="enterprise" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need More Credits?
          </h2>
          <p className="text-gray-300 mb-8">
            Purchase credit packs to top up your balance
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(CREDIT_PACKS).map(([packId, config]) => (
            <CreditPackCard key={packId} packId={packId} config={config} />
          ))}
        </div>
      </main>
    </div>
  );
}

function SubscriptionCard({ tier, featured }: { tier: keyof typeof SUBSCRIPTION_TIERS; featured?: boolean }) {
  const config = SUBSCRIPTION_TIERS[tier];

  return (
    <div className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 ${
      featured ? 'border-yellow-400 scale-105' : 'border-white/10'
    }`}>
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{config.name}</h3>
        <div className="text-4xl font-bold text-white mb-2">
          ${config.price}
          <span className="text-lg text-gray-400">/month</span>
        </div>
        <p className="text-gray-300">{config.credits} credits/month</p>
      </div>
      <ul className="space-y-3 mb-6">
        {config.features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
        <li className="flex items-center text-gray-300">
          <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
          Up to {config.maxApps} apps
        </li>
      </ul>
      <Link
        href={`/login?tier=${tier}`}
        className={`block text-center py-3 rounded-lg font-semibold transition-opacity ${
          featured 
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        Subscribe Now
      </Link>
    </div>
  );
}

function CreditPackCard({ packId, config }: { packId: string; config: any }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-yellow-400/50 transition-colors">
      <div className="text-4xl font-bold text-white mb-2">
        {config.credits}
      </div>
      <div className="text-lg text-gray-300 mb-2">Credits</div>
      <div className="text-2xl font-bold text-white mb-4">
        ${config.price}
      </div>
      {config.bonus > 0 && (
        <div className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold mb-4">
          {config.bonus}% Bonus
        </div>
      )}
      <Link
        href={`/login?pack=${packId}`}
        className="block bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
      >
        Purchase
      </Link>
    </div>
  );
}

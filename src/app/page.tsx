'use client';

import Link from 'next/link';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GOLDEN BASE AI BUILDER</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Build AI-Powered Apps
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              In Minutes, Not Months
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            The no-code AI builder for Farcaster and Base. Generate, deploy, and monetize your apps with the power of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Start Building Now
            </Link>
            <Link
              href="/pricing"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Lightning Fast"
            description="Generate production-ready apps in seconds with our advanced AI models"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-Powered"
            description="Multiple AI providers including Groq, OpenRouter, OpenAI, and Gemini"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Reliable"
            description="Built on Base blockchain with enterprise-grade security"
          />
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Trusted by builders worldwide
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard number="10K+" label="Apps Built" />
            <StatCard number="50K+" label="AI Generations" />
            <StatCard number="20+" label="Connectors" />
            <StatCard number="99.9%" label="Uptime" />
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                <TrendingUp className="w-6 h-6 inline mr-2 text-yellow-400" />
                Monetize Your Work
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Deploy to multiple platforms</li>
                <li>• Sell apps in marketplace</li>
                <li>• Earn from connectors</li>
                <li>• Accept crypto payments</li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                <Sparkles className="w-6 h-6 inline mr-2 text-yellow-400" />
                Advanced Features
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Farcaster Frame generation</li>
                <li>• Token deployment on Base</li>
                <li>• 20+ platform integrations</li>
                <li>• DeFi features included</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 GOLDEN BASE AI BUILDER. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-colors">
      <div className="text-yellow-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-gray-300">{label}</div>
    </div>
  );
}

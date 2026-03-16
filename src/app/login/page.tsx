'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fid, setFid] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        fid,
        username,
        redirect: false,
      });

      if (result?.error) {
        alert('Failed to sign in. Please try again.');
      } else {
        const tier = searchParams.get('tier');
        const pack = searchParams.get('pack');
        
        if (tier) {
          router.push(`/dashboard/billing?subscribe=${tier}`);
        } else if (pack) {
          router.push(`/dashboard/billing?pack=${pack}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome to Golden Base AI
          </h1>
          <p className="text-gray-400">
            Sign in with your Farcaster account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fid" className="block text-sm font-medium text-gray-300 mb-2">
              Farcaster ID (FID)
            </label>
            <input
              id="fid"
              type="number"
              value={fid}
              onChange={(e) => setFid(e.target.value)}
              required
              placeholder="Enter your FID"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Farcaster Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="@username"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In with Farcaster'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have a Farcaster account?{' '}
          <a
            href="https://warpcast.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300"
          >
            Create one
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            <br />
            All features require a paid subscription or credits.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionButton({
  tier,
  current,
  disabled,
}: {
  tier: string;
  current: string | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isActive = current === tier;

  const handleClick = async () => {
    if (isActive || disabled || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isActive || disabled || loading}
      className={`w-full py-2 rounded-lg font-semibold transition-opacity ${
        isActive
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90'
      }`}
    >
      {loading ? 'Processing...' : isActive ? 'Current Plan' : 'Subscribe'}
    </button>
  );
}

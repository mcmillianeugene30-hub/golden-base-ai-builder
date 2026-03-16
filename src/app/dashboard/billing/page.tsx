import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { SUBSCRIPTION_TIERS, CREDIT_PACKS } from '@/packages/config/admin';
import { CreditCard, Zap, Clock, CheckCircle2 } from 'lucide-react';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { redirect: '/login' };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true, transactions: { orderBy: { createdAt: 'desc' } } },
  });

  const isAdmin = user?.fid === 1378286 || user?.username === 'urbanwarrior79';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Billing & Credits
        </h1>
        <p className="text-gray-400">
          Manage your subscription and purchase credits
        </p>
      </div>

      {!isAdmin && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-yellow-400 mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {user?.credits || 0}
              </div>
              <div className="text-gray-400">Credits Available</div>
            </div>

            {user?.subscription && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-blue-400 mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-white mb-2 capitalize">
                  {user.subscription.tier}
                </div>
                <div className="text-gray-400">Current Plan</div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="text-green-400 mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {user?.subscription?.renewAt
                  ? new Date(user.subscription.renewAt).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className="text-gray-400">Next Renewal</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Change Subscription
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
                <SubscriptionCard
                  key={key}
                  tier={key as keyof typeof SUBSCRIPTION_TIERS}
                  config={tier}
                  current={user?.subscription?.tier}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Purchase Credits
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(CREDIT_PACKS).map(([packId, pack]) => (
                <CreditPackCard key={packId} packId={packId} config={pack} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Transaction History
            </h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
              {user?.transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No transactions yet
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user?.transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-white/10">
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                          {tx.type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 capitalize">
                          {tx.method}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">
                          ${parseFloat(tx.amount.toString()).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.status === 'completed'
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-yellow-400/20 text-yellow-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {isAdmin && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            Admin Account
          </h2>
          <p className="text-gray-300 mb-4">
            You have unlimited access to all features. No payment required.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Unlimited credits</li>
            <li>✓ Unlimited app creation</li>
            <li>✓ All AI providers unlocked</li>
            <li>✓ All connectors unlocked</li>
            <li>✓ Full dashboard access</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({
  tier,
  config,
  current,
}: {
  tier: string;
  config: any;
  current: string | null;
}) {
  const isActive = current === tier;

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 ${
        isActive ? 'border-yellow-400' : 'border-white/10'
      }`}
    >
      <h3 className="text-lg font-bold text-white mb-2">{config.name}</h3>
      <div className="text-2xl font-bold text-white mb-4">
        ${config.price}
        <span className="text-sm text-gray-400">/month</span>
      </div>
      <ul className="space-y-2 mb-6 text-sm text-gray-300">
        <li>• {config.credits} credits/month</li>
        <li>• Up to {config.maxApps} apps</li>
        {config.features.map((f: string, i: number) => (
          <li key={i}>• {f}</li>
        ))}
      </ul>
      <button
        disabled={isActive}
        className={`w-full py-2 rounded-lg font-semibold transition-opacity ${
          isActive
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:opacity-90'
        }`}
      >
        {isActive ? 'Current Plan' : 'Subscribe'}
      </button>
    </div>
  );
}

function CreditPackCard({
  packId,
  config,
}: {
  packId: string;
  config: any;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-yellow-400/50 transition-colors">
      <div className="text-3xl font-bold text-white mb-2">
        {config.credits}
      </div>
      <div className="text-gray-400 mb-4">Credits</div>
      <div className="text-xl font-bold text-white mb-4">
        ${config.price}
      </div>
      {config.bonus > 0 && (
        <div className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold mb-4">
          {config.bonus}% Bonus
        </div>
      )}
      <button className="w-full bg-white/10 text-white py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors">
        Purchase
      </button>
    </div>
  );
}

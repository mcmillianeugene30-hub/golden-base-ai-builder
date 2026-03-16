import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Code2, CreditCard, TrendingUp, Zap } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const isAdmin = user?.fid === 1378286 || user?.username === 'urbanwarrior79';

  const [totalApps, totalApiUsage] = await Promise.all([
    db.app.count({ where: { userId: session.user.id } }),
    db.apiUsage.count({ where: { userId: session.user.id } }),
  ]);

  const stats = [
    {
      name: 'Credits Balance',
      value: isAdmin ? 'Unlimited' : `${user?.credits || 0}`,
      icon: CreditCard,
      color: 'text-yellow-400',
    },
    {
      name: 'Total Apps',
      value: totalApps.toString(),
      icon: Code2,
      color: 'text-blue-400',
    },
    {
      name: 'AI Generations',
      value: totalApiUsage.toString(),
      icon: Zap,
      color: 'text-purple-400',
    },
    {
      name: 'Subscription',
      value: user?.subscription?.tier || 'None',
      icon: LayoutDashboard,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your account
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className={stat.color}>
              <stat.icon className="w-8 h-8 mb-4" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/dashboard/builder"
              className="block bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4 hover:from-yellow-400/30 hover:to-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-semibold text-white">Create New App</div>
                  <div className="text-sm text-gray-400">Generate with AI</div>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/billing"
              className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-semibold text-white">Manage Billing</div>
                  <div className="text-sm text-gray-400">Upgrade or purchase credits</div>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/connectors"
              className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-semibold text-white">Connect Platforms</div>
                  <div className="text-sm text-gray-400">Integrate your tools</div>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Subscription Status
          </h2>
          {user?.subscription ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                <div className="text-2xl font-bold text-white capitalize">
                  {user.subscription.tier}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Credits Available</div>
                <div className="text-xl font-semibold text-white">
                  {user.credits} / {user.subscription.credits}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Apps Used</div>
                <div className="text-xl font-semibold text-white">
                  {totalApps} / {user.subscription.maxApps}
                </div>
              </div>
              {isAdmin && (
                <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 mt-4">
                  <div className="text-sm text-yellow-400 font-semibold mb-1">
                    Admin Account
                  </div>
                  <div className="text-xs text-gray-400">
                    You have unlimited access to all features
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                No active subscription
              </p>
              <a
                href="/dashboard/billing"
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View Plans
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';
import { redirect } from 'next/navigation';
import { Users, DollarSign, Code2, Zap, TrendingUp, Shield } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const isAdmin = user?.fid === ADMIN_CONFIG.fid || user?.username === ADMIN_CONFIG.username;

  if (!isAdmin) {
    redirect('/dashboard');
  }

  const [totalUsers, totalApps, totalTransactions, totalRevenue] = await Promise.all([
    db.user.count(),
    db.app.count(),
    db.transaction.count({ where: { status: 'completed' } }),
    db.transaction.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    }),
  ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { subscription: true },
  });

  const recentTransactions = await db.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: true },
  });

  const connectorRevenue = await db.connectorRevenue.findMany({
    orderBy: { totalRevenue: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-gray-400">
          Full platform control and analytics
        </p>
      </div>

      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-yellow-400">
            <Shield className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-1">
              Admin Access Granted
            </h3>
            <p className="text-gray-300">
              You have full administrative privileges. All features are free and unlimited.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-400" />}
          label="Total Users"
          value={totalUsers}
          change="+12.5%"
          positive
        />
        <StatCard
          icon={<Code2 className="w-8 h-8 text-green-400" />}
          label="Total Apps"
          value={totalApps}
          change="+8.3%"
          positive
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8 text-yellow-400" />}
          label="Total Revenue"
          value={`$${totalRevenue._sum.amount ? totalRevenue._sum.amount.toFixed(2) : '0.00'}`}
          change="+15.2%"
          positive
        />
        <StatCard
          icon={<Zap className="w-8 h-8 text-purple-400" />}
          label="Transactions"
          value={totalTransactions}
          change="+23.1%"
          positive
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Recent Users
          </h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium text-white">{u.username || 'Unknown'}</div>
                  <div className="text-sm text-gray-400">FID: {u.fid}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${u.subscription ? 'text-green-400' : 'text-gray-400'}`}>
                    {u.subscription?.tier || 'No Subscription'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium text-white capitalize">
                    {tx.type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.user?.username || 'Unknown'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${parseFloat(tx.amount.toString()).toFixed(2)}
                  </div>
                  <div className={`text-xs ${
                    tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Top Connector Revenue
          </h2>
          <div className="space-y-3">
            {connectorRevenue.map((cr) => (
              <div key={cr.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium text-white">
                    Connector {cr.connectorId.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-400 capitalize">
                    {cr.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${parseFloat(cr.totalRevenue.toString()).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {parseFloat(cr.developerShare.toString()).toFixed(2)} to dev
                  </div>
                </div>
              </div>
            ))}
            {connectorRevenue.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No connector revenue data yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              Manage Users
            </button>
            <button className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              View Subscriptions
            </button>
            <button className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              Process Payouts
            </button>
            <button className="bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="mb-4">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className={`flex items-center gap-1 text-sm ${
        positive ? 'text-green-400' : 'text-red-400'
      }`}>
        <TrendingUp className="w-4 h-4" />
        {change}
      </div>
    </div>
  );
}

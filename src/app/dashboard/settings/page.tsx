'use client';

import { useState, useEffect } from 'react';
import { User, Wallet, Shield, Bell, CreditCard, LogOut, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username,
          email: user?.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SettingsSection
            icon={<User className="w-5 h-5" />}
            title="Profile Information"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Farcaster ID (FID)
                </label>
                <input
                  type="text"
                  value={user?.fid || ''}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  placeholder="@username"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </SettingsSection>

          <SettingsSection
            icon={<Wallet className="w-5 h-5" />}
            title="Wallet Settings"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Wallet Address
                </label>
                <input
                  type="text"
                  value={user?.walletAddress || ''}
                  onChange={(e) => setUser({ ...user, walletAddress: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Used for crypto payments and token deployment
                </p>
              </div>

              <button
                className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Bell className="w-5 h-5" />}
            title="Notification Preferences"
          >
            <div className="space-y-4">
              <NotificationToggle
                label="Email notifications"
                description="Receive email updates about your account"
                checked={notifications.email}
                onChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
              <NotificationToggle
                label="Push notifications"
                description="Receive in-app notifications"
                checked={notifications.push}
                onChange={(checked) => setNotifications({ ...notifications, push: checked })}
              />
              <NotificationToggle
                label="Marketing emails"
                description="Receive product updates and promotions"
                checked={notifications.marketing}
                onChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<Shield className="w-5 h-5" />}
            title="Security"
          >
            <div className="space-y-4">
              <button className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors w-full text-left">
                Change Password
              </button>
              <button className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors w-full text-left">
                Enable Two-Factor Authentication
              </button>
              <button className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors w-full text-left">
                View Connected Apps
              </button>
            </div>
          </SettingsSection>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Account Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-400/10 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-400/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20 transition-colors">
                <Shield className="w-5 h-5" />
                Deactivate Account
              </button>
            </div>
          </div>

          {user?.isAdmin && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                Admin Access
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                You have full administrative access to the platform.
              </p>
              <a
                href="/dashboard/admin"
                className="block w-full text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Admin Dashboard
              </a>
            </div>
          )}

          <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">
              Need Help?
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Our support team is here to assist you
            </p>
            <button className="w-full bg-white/10 text-white py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <span className="text-yellow-400">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-green-400' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

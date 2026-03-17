'use client';

import { useState, useEffect } from 'react';
import { Plus, Play, Download, Trash2, Code2, Zap } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { ADMIN_CONFIG } from '@/packages/config/admin';
import { redirect } from 'next/navigation';

export default async function AppsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { 
      subscription: true,
      apps: {
        orderBy: { updatedAt: 'desc' },
        include: { deployments: true },
      },
    },
  });

  const isAdmin = user?.fid === ADMIN_CONFIG.fid || user?.username === ADMIN_CONFIG.username;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            My Apps
          </h1>
          <p className="text-gray-400">
            Manage your generated applications
          </p>
        </div>
        <a
          href="/dashboard/builder"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New App
        </a>
      </div>

      {isAdmin && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
          <div className="text-sm text-yellow-400 font-semibold mb-1">
            Admin Account - Unlimited Access
          </div>
          <div className="text-xs text-gray-400">
            You can create unlimited apps without restrictions
          </div>
        </div>
      )}

      {user?.apps.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No apps yet
          </h3>
          <p className="text-gray-400 mb-6">
            Start building your first AI-powered app
          </p>
          <a
            href="/dashboard/builder"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Create Your First App
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.apps.map((app) => (
            <AppCard key={app.id} app={app} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {!isAdmin && user?.subscription && (
        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 mt-6">
          <div className="text-sm text-blue-400 font-semibold mb-1">
            App Usage
          </div>
          <div className="text-xs text-gray-400">
            {user.apps.length} / {user.subscription.maxApps} apps used
            {user.apps.length >= user.subscription.maxApps && (
              <span className="text-red-400 ml-2"> - Limit reached</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AppCard({ app, isAdmin }: { app: any; isAdmin: boolean }) {
  const handlePreview = () => {
    if (app.code) {
      const blob = new Blob([app.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    if (app.code) {
      const blob = new Blob([app.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.replace(/\s+/g, '-').toLowerCase()}.html`;
      a.click();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-yellow-400/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {app.name}
          </h3>
          {app.description && (
            <p className="text-sm text-gray-400">{app.description}</p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(app.updatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {app.deployments.length > 0 ? (
          <span className="text-xs text-green-400 px-2 py-1 rounded-full bg-green-400/20">
            {app.deployments.length} Deployments
          </span>
        ) : (
          <span className="text-xs text-gray-400 px-2 py-1 rounded-full bg-white/5">
            Not Deployed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center justify-center gap-2 bg-white/10 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-white/10 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}

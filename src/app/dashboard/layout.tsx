import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardV33Shell from '@/components/DashboardV33Shell';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/dashboard')}`);
  }

  return <DashboardV33Shell />;
}

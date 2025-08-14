import dynamic from 'next/dynamic';

// Use suspense to avoid aborted fetch during rapid route transitions
const Dashboard = dynamic(() => import('@/pages/Dashboard'), { ssr: false, suspense: true });

export default function DashboardPage() {
  return (
    <Dashboard />
  );
}



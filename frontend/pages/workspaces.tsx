import dynamic from 'next/dynamic';

const Workspaces = dynamic(() => import('@/pages/Workspaces/Workspaces'), { ssr: false });

export default function WorkspacesPage() {
  return <Workspaces />;
}



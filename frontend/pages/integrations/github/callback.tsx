import dynamic from 'next/dynamic';
import Layout from '@/layout/Layout';

const GitHubCallback = dynamic(() => import('@/pages/integrations/GitHubCallback'), { ssr: false });

export default function GitHubCallbackPage() {
  return (
    <Layout>
      <GitHubCallback />
    </Layout>
  );
}
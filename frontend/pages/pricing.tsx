import dynamic from 'next/dynamic';
const Pricing = dynamic(() => import('@/pages/Pricing'), { ssr: false });
const Layout = dynamic(() => import('@/layout/Layout'), { ssr: false });

export default function PricingPage() {
  return (
    <Layout>
      <Pricing />
    </Layout>
  );
}



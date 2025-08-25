import dynamic from 'next/dynamic';
const Layout = dynamic(() => import('@/layout/Layout'), { ssr: false });
const Pricing = dynamic(() => import('@/components/Pricing'), { ssr: false });

export default function PricingPage() {
  return (
    <Layout>
      <Pricing />
    </Layout>
  );
}



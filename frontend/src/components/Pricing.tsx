import Link from 'next/link';
import { Button } from './ui/button';

export default function Pricing(): JSX.Element {
  return (
    <div className="min-h-screen w-full" style={{ background: '#000000' }}>
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h1
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-3"
            style={{ color: '#ffffff' }}
          >
            Simple, transparent pricing
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: '#a1a1aa' }}
          >
            Start for free. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
          <div className="md:col-start-2 rounded-2xl p-6 md:p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="mb-6">
              <span
                className="text-sm uppercase tracking-wider"
                style={{ color: '#a1a1aa' }}
              >
                Free
              </span>
              <h2
                className="mt-2 text-3xl font-semibold"
                style={{ color: '#ffffff' }}
              >
                $0 <span className="text-base font-normal" style={{ color: '#a1a1aa' }}>/ month</span>
              </h2>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ color: '#e4e4e7' }}>Core features included</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ color: '#e4e4e7' }}>Unlimited projects</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                <span style={{ color: '#e4e4e7' }}>Community support</span>
              </li>
            </ul>

            <Button asChild size="lg" className="w-full" style={{ minHeight: '44px' }}>
              <Link href="/register">Get started</Link>
                    </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Join the Waitlist', template: 'Teaching Labs · %s' },
};

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "You're on the List",
};

export default function WaitlistConfirmedLayout({ children }: { children: React.ReactNode }) {
  return children;
}

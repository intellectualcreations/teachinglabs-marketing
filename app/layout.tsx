import type { Metadata } from 'next';
import { Inter, Open_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import AuthProvider from '@/components/shared/AuthProvider';
import ServiceWorkerRegistrar from '@/components/shared/ServiceWorkerRegistrar';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'TeachingLabs',
  description: 'AI-powered teaching platform for K-12 education',
  manifest: '/manifest.json',
  themeColor: '#1F3A5F',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Teaching Labs',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var mo = new MutationObserver(function(){
              document.querySelectorAll('.fade-up:not([data-seen])').forEach(function(el){
                el.setAttribute('data-seen','1');
                el.style.opacity='0';
                el.style.transform='translateY(30px)';
              });
            });
            mo.observe(document.documentElement,{childList:true,subtree:true});
          })();
        `}} />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ServiceWorkerRegistrar />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

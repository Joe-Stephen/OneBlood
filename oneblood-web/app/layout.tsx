import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OneBlood — Connect Blood Donors in India',
  description: 'OneBlood connects blood donors with recipients across India. Find compatible donors nearby, post emergency SOS requests, and track your donation history.',
  keywords: ['blood donation', 'blood donors', 'India', 'emergency blood', 'SOS'],
  openGraph: {
    title: 'OneBlood — Connect Blood Donors in India',
    description: 'Find compatible blood donors near you. Save lives with OneBlood.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </body>
    </html>
  );
}

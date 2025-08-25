import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaks Naturals - Premium Natural Skincare & Wellness',
  description: 'Discover premium natural skincare, wellness products, and lifestyle essentials. Experience the power of nature with Kaks Naturals.',
  keywords: 'natural skincare, wellness, organic, beauty, health',
  openGraph: {
    title: 'Kaks Naturals - Premium Natural Skincare & Wellness',
    description: 'Discover premium natural skincare, wellness products, and lifestyle essentials.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['Segoe UI', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'NyahMuk — Risk Dashboard',
  description: 'Mosquito breeding-risk prediction and community reporting platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="m-0 font-[family-name:var(--font-inter)] bg-[#0d1e1b] text-[#e7f5ef]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

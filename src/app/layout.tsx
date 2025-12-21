import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sium',
  description: '간편한 전단지 제작 및 공유 서비스',
  icons: {
    icon: '/favicon.png',
  },
};

import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';

// ... (existing imports)

import { ToastProvider } from '@/components/ui/Toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <Header user={user} />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

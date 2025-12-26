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
  description: '귀여운 캐릭터와 함께 성장하는 습관 형성 앱',
  icons: {
    icon: '/favicon.png',
  },
};

import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/server';
import { ToastProvider } from '@/components/ui/Toast';
import { CharacterProvider } from '@/components/providers/CharacterProvider';

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
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CharacterProvider>
          <ToastProvider>
            <Header user={user} />
            {children}
          </ToastProvider>
        </CharacterProvider>
      </body>
    </html>
  );
}


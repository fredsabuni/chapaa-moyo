import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Roboto_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Chapaa · Moyo Platform',
  description: 'Live fundraising dashboard for children cardiac surgery — Moyo Foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${robotoMono.variable}`}>{children}</body>
    </html>
  );
}

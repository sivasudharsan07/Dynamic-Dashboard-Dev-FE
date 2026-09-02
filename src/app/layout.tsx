import type { Metadata } from 'next';
import '@/styles/global.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';

export const metadata: Metadata = {
  title: 'Dynamic Dashboard — AI-Powered Analytics',
  description: 'Enterprise AI analytics platform with dynamic dashboards, governed data, and intelligent insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
      <link rel="icon" type="image/svg+xml" href="/branding/favicon.svg" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

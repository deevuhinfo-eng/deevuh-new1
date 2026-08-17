'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ConfigProvider } from '@/lib/use-config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ConfigProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                'rounded-none border border-border bg-background text-foreground font-sans text-sm tracking-wide',
            },
          }}
        />
      </ConfigProvider>
    </ThemeProvider>
  );
}

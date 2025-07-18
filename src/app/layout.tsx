import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles/globals.css';
import { SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar';
import { AppSidebar } from '@/src/components/app-sidebar';
import { Toaster } from '@/src/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <main className="min-h-screen w-full">
            <div className="border-b border-gray-300 bg-white p-1">
              <SidebarTrigger className="cursor-pointer" />
            </div>
            <div className="h-[calc(100vh_-_37px)] bg-gray-100 overflow-y-auto">{children}</div>
          </main>
        </SidebarProvider>
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}

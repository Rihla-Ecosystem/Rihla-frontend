import type { Metadata } from "next";
import "../styles/index.css";
import { AuthProvider } from "@/lib/auth";
import { LocationProvider } from "@/providers/LocationProvider";
import { LocationMocker } from '@/app/components/ui/LocationMocker';
import { TestHub } from '@/app/components/ui/TestHub';
import RegisterSW from '@/app/components/ui/RegisterSW';

export const metadata: Metadata = {
  title: "Rihla - AI Travel Companion",
  description:
    "Rihla is an AI-powered travel companion designed for international tourists in Egypt, offering personalized itineraries and local insights to enhance exploration and ensure a luxurious experience.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`html, body { height: 100%; margin: 0; } #root { height: 100%; }`}</style>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LocationProvider>
            {children}
            {process.env.NODE_ENV === 'development' && <LocationMocker />}
            {process.env.NODE_ENV === 'development' && <TestHub />}
            <RegisterSW />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



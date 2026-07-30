import type { Metadata } from "next";
import "../styles/index.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rihla - AI Travel Companion",
  description:
    "Rihla is an AI-powered travel companion designed for international tourists in Egypt, offering personalized itineraries and local insights to enhance exploration and ensure a luxurious experience.",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


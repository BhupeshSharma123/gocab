import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoCab - Ride Hailing App",
  description: "Book rides, earn money driving, manage your fleet with GoCab.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '14px' } }} />
        {children}
      </body>
    </html>
  );
}

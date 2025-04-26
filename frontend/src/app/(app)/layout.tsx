'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./../globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ProtectedLayout from "@/components/ProtectedLayout";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderWrapper>
        <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex flex-1">
            <Sidebar />
            <div className="flex-1 p-6">
              <ProtectedLayout>
                {children}
              </ProtectedLayout>
            </div>
        </main>
        <Footer />
        </div>
    </SessionProviderWrapper>
  );
}

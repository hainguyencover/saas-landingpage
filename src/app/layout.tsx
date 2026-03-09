import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SalonPro - Quản lý Salon chuyên nghiệp",
    description: "Giải pháp quản lý toàn diện cho Salon của bạn.",
};

import I18nProvider from "@/lib/i18n-context";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" className="scroll-smooth">
            <body className={`${inter.className} bg-slate-50 selection:bg-blue-100 selection:text-blue-900`}>
                <I18nProvider>
                    <Navbar />
                    <main className="min-h-screen pt-20">
                        {children}
                    </main>
                    <Footer />
                </I18nProvider>
            </body>
        </html>
    );
}

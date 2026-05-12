import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "帝国操盘室 - 投资决策仪表盘",
  description: "个人投资组合管理与决策系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-white">
          <Navigation />
          <main className="lg:ml-64 pb-20 lg:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

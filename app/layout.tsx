import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { PortfolioProvider } from "@/lib/store/portfolio-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvestScope 投资看板 - 投资决策仪表盘",
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
        <PortfolioProvider>
          <div className="min-h-screen bg-background text-white flex flex-col">
            <Navigation />
            <main className="lg:ml-64 flex-1 pb-20 lg:pb-8">
              {children}
            </main>
            <footer className="lg:ml-64 bg-slate-900/50 border-t border-slate-700/50 py-4 px-4 text-center text-xs text-slate-400">
              <div className="max-w-7xl mx-auto space-y-1">
                <p className="font-medium text-amber-400">⚠️ 免责声明</p>
                <p>本工具仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。</p>
                <p>数据可能存在延迟，请以官方渠道为准。</p>
                <p className="text-slate-500 mt-2">InvestScope 投资看板 v4.0</p>
              </div>
            </footer>
          </div>
        </PortfolioProvider>
      </body>
    </html>
  );
}

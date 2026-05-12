import { portfolioData, t0Targets, usStocks, hkStocks } from '@/data/portfolio';
import AssetDetailClient from './AssetDetailClient';

export async function generateStaticParams() {
  const codes = [
    ...portfolioData.funds.map(f => f.code),
    ...portfolioData.etfStocks.map(e => e.code),
    ...t0Targets.map(t => t.code),
    ...usStocks.map(s => s.code),  // Add US stock codes
    ...hkStocks.map(s => s.code),  // Add HK stock codes
  ];
  return codes.map((code) => ({
    code: code,
  }));
}

export default function AssetDetailPage() {
  return <AssetDetailClient />;
}

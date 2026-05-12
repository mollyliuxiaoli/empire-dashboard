import { portfolioData, t0Targets } from '@/data/portfolio';
import AssetDetailClient from './AssetDetailClient';

export async function generateStaticParams() {
  const codes = [
    ...portfolioData.funds.map(f => f.code),
    ...portfolioData.etfStocks.map(e => e.code),
    ...t0Targets.map(t => t.code) // Include T0 targets to fix 404 issue
  ];
  return codes.map((code) => ({
    code: code,
  }));
}

export default function AssetDetailPage() {
  return <AssetDetailClient />;
}

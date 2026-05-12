import { portfolioData } from '@/data/portfolio';
import AssetDetailClient from './AssetDetailClient';

export async function generateStaticParams() {
  const codes = [
    ...portfolioData.funds.map(f => f.code),
    ...portfolioData.etfStocks.map(e => e.code)
  ];
  return codes.map((code) => ({
    code: code,
  }));
}

export default function AssetDetailPage() {
  return <AssetDetailClient />;
}

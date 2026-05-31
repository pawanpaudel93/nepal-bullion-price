export interface NepalGoldPrice {
  hallmark: number;
  tajabi: number;
  unit: 'tola';
  perGram10: number;
  previousPrice: number | null;
  history: { date: string; price: number }[] | null;
  priceDate: string | null;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface NepalSilverPrice {
  price: number;
  unit: 'tola';
  perGram10: number;
  previousPrice: number | null;
  history: { date: string; price: number }[] | null;
  priceDate: string | null;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface EstimateBreakdown {
  basePrice: number;
  customsDuty: number;
  importerMargin: number;
  dealerMargin: number;
  estimatedAdjustment: number;
  estimatedPrice: number;
}

export interface LiveMetalPrice {
  raw: {
    usdPerOz: number;
    usdToNpr: number;
  };
  perTola: EstimateBreakdown;
  rates: EstimateRates;
  source: string;
  updatedAt: string;
  isStale: boolean;
}

export interface EstimateRates {
  customsDuty: number;
  importerMargin: number;
  dealerMargin: number;
  estimatedAdjustment: number;
}

export interface MetalRates {
  gold: EstimateRates;
  silver: EstimateRates;
}

export interface Config {
  rates: MetalRates;
  apiKeys: {
    goldApiIo?: string;
    asheshApiKey?: string;
    gnewsApiKey?: string;
  };
  cacheTtl: number;
}

export interface AllPrices {
  gold: {
    nepal: NepalGoldPrice | null;
    live: LiveMetalPrice | null;
  };
  silver: {
    nepal: NepalSilverPrice | null;
    live: LiveMetalPrice | null;
  };
}

export interface NepalPriceData {
  goldHallmark: number;
  goldTajabi: number;
  silver: number;
  goldHallmarkPerGram10: number;
  goldTajabiPerGram10: number;
  silverPerGram10: number;
  previousGoldHallmark: number | null;
  previousSilver: number | null;
  goldHistory: { date: string; price: number }[] | null;
  silverHistory: { date: string; price: number }[] | null;
  priceDate: string | null;
  date: string;
}

export interface LivePriceData {
  priceUsd: number;
  symbol: string;
  updatedAt: string;
}

export interface ForexData {
  usdToNpr: number;
  updatedAt: string;
}

export interface Provider<T> {
  name: string;
  fetch: () => Promise<T>;
}

export interface ProviderResult<T> {
  data: T;
  source: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  url: string;
  source: string;
  language: 'en' | 'np';
  publishedAt: string;
  imageUrl?: string;
  category?: 'gold' | 'silver' | 'market' | 'general';
}

export interface NewsData {
  items: NewsItem[];
  fetchedAt: string;
}

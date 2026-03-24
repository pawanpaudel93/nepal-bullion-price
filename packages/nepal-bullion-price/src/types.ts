export interface NepalGoldPrice {
  hallmark: number;
  tajabi: number;
  unit: 'tola';
  perGram10: number;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface NepalSilverPrice {
  price: number;
  unit: 'tola';
  perGram10: number;
  source: string;
  date: string;
  updatedAt: string;
  isStale: boolean;
}

export interface TaxBreakdown {
  basePrice: number;
  customDuty: number;
  bankMargin: number;
  dealerMargin: number;
  estimatedPrice: number;
  luxuryTax: number;
  consumerPrice: number;
}

export interface LiveMetalPrice {
  raw: {
    usdPerOz: number;
    usdToNpr: number;
  };
  perTola: TaxBreakdown;
  rates: TaxRates;
  source: string;
  updatedAt: string;
  isStale: boolean;
}

export interface TaxRates {
  customDuty: number;
  bankMargin: number;
  dealerMargin: number;
  luxuryTax: number;
}

export interface Config {
  rates: TaxRates;
  apiKeys: {
    goldApiIo?: string;
    asheshApiKey?: string;
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

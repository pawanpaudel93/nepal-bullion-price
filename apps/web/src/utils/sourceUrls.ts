const SOURCE_URLS: Record<string, string> = {
  'fenegosida.org': 'https://fenegosida.org/',
  'ashesh.com.np': 'https://www.ashesh.com.np/gold/',
  'hamropatro.com': 'https://www.hamropatro.com/gold',
  'gold-api.com': 'https://www.gold-api.com/',
  'swissquote': 'https://www.swissquote.com/',
  'goldapi.io': 'https://www.goldapi.io/',
  'nrb.org.np': 'https://www.nrb.org.np/forex/',
  'fawazahmed0': 'https://github.com/fawazahmed0/exchange-api',
  'exchangerate-api': 'https://www.exchangerate-api.com/',
};

export function getSourceUrl(source: string): string | null {
  return SOURCE_URLS[source] ?? null;
}

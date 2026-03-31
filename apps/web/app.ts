import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getAllPrices,
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
  getNews,
} from 'nepal-bullion-price';

const app = new Hono().basePath('/api');

// CORS: Allow all origins — this is a public price API
app.use('/*', cors());

app.onError((err, c) => {
  console.error('API error:', err.message);
  return c.json({ error: err.message }, 500);
});

// Cache at Vercel edge: 60s fresh, serve stale up to 5min while revalidating
const CACHE_HEADER = 'public, s-maxage=60, stale-while-revalidate=300';

app.get('/prices', async (c) => {
  const prices = await getAllPrices();
  c.header('Cache-Control', CACHE_HEADER);
  return c.json(prices);
});

app.get('/gold', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalGoldPrice(),
    getLiveGoldPrice(),
  ]);
  c.header('Cache-Control', CACHE_HEADER);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

app.get('/silver', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalSilverPrice(),
    getLiveSilverPrice(),
  ]);
  c.header('Cache-Control', CACHE_HEADER);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

const NEWS_CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=900';

app.get('/news', async (c) => {
  const lang = c.req.query('lang') as 'en' | 'np' | undefined;
  const news = await getNews(lang);
  c.header('Cache-Control', NEWS_CACHE_HEADER);
  return c.json(news);
});

export default app;

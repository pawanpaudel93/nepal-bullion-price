import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getAllPrices,
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
} from 'nepal-bullion-price';

const app = new Hono().basePath('/api');

app.use('/*', cors());

app.onError((err, c) => {
  console.error('API error:', err.message);
  return c.json({ error: err.message }, 500);
});

app.get('/prices', async (c) => {
  const prices = await getAllPrices();
  return c.json(prices);
});

app.get('/gold', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalGoldPrice(),
    getLiveGoldPrice(),
  ]);
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
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

export default app;

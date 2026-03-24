import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getAllPrices,
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
} from 'nepal-bullion-price';

const app = new Hono();

app.use('/api/*', cors());

app.onError((err, c) => {
  console.error('API error:', err.message);
  return c.json({ error: err.message }, 500);
});

app.get('/api/prices', async (c) => {
  const prices = await getAllPrices();
  return c.json(prices);
});

app.get('/api/gold', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalGoldPrice(),
    getLiveGoldPrice(),
  ]);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

app.get('/api/silver', async (c) => {
  const [nepal, live] = await Promise.allSettled([
    getNepalSilverPrice(),
    getLiveSilverPrice(),
  ]);
  return c.json({
    nepal: nepal.status === 'fulfilled' ? nepal.value : null,
    live: live.status === 'fulfilled' ? live.value : null,
  });
});

// Serve static files in production
app.use('/*', serveStatic({ root: './dist' }));

const port = parseInt(process.env.PORT ?? '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

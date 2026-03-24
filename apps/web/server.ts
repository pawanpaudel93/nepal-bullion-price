import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import app from './app.js';

const server = new Hono();

// Mount API routes
server.route('/', app);

// Serve static files in production
server.use('/*', serveStatic({ root: './dist' }));

const port = parseInt(process.env.PORT ?? '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: server.fetch, port });

import { handle } from 'hono/vercel';
import app from '../app.js';

export const GET = handle(app);

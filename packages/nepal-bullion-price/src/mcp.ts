import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  getNepalGoldPrice,
  getNepalSilverPrice,
  getLiveGoldPrice,
  getLiveSilverPrice,
  getAllPrices,
} from './index.js';

const server = new McpServer({
  name: 'nepal-bullion-price',
  version: '0.2.1',
});

server.tool(
  'get_nepal_gold_price',
  'Get today\'s FENEGOSIDA gold price in Nepal (hallmark + tajabi) per tola and per 10 grams, with yesterday\'s price for comparison',
  {},
  async () => {
    const price = await getNepalGoldPrice();
    return { content: [{ type: 'text', text: JSON.stringify(price, null, 2) }] };
  },
);

server.tool(
  'get_nepal_silver_price',
  'Get today\'s FENEGOSIDA silver price in Nepal per tola and per 10 grams, with yesterday\'s price for comparison',
  {},
  async () => {
    const price = await getNepalSilverPrice();
    return { content: [{ type: 'text', text: JSON.stringify(price, null, 2) }] };
  },
);

server.tool(
  'get_live_gold_price',
  'Get live international gold price (XAU/USD) converted to NPR per tola with full Nepal import duty breakdown (customs, bank margin, dealer margin, market premium)',
  {},
  async () => {
    const price = await getLiveGoldPrice();
    return { content: [{ type: 'text', text: JSON.stringify(price, null, 2) }] };
  },
);

server.tool(
  'get_live_silver_price',
  'Get live international silver price (XAG/USD) converted to NPR per tola with full Nepal import duty breakdown (customs, bank margin, dealer margin, market premium)',
  {},
  async () => {
    const price = await getLiveSilverPrice();
    return { content: [{ type: 'text', text: JSON.stringify(price, null, 2) }] };
  },
);

server.tool(
  'get_all_prices',
  'Get all Nepal bullion prices at once: FENEGOSIDA daily rates + live international prices with duty breakdown for both gold and silver',
  {},
  async () => {
    const prices = await getAllPrices();
    return { content: [{ type: 'text', text: JSON.stringify(prices, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

interface ShareCardData {
  metal: 'gold' | 'silver';
  metalName: string;
  price: number;
  previousPrice: number | null;
  history: { date: string; price: number }[] | null;
  narrativeText: string;
  numberLocale: string;
  date: string;
  priceDate?: string | null;
}

const CARD_SIZE = 1080;
const BG_DARK = '#1C1917';
const BG_DARK2 = '#292524';
const GOLD_COLOR = '#D4A843';
const SILVER_COLOR = '#D6D3D1';
const GREEN = '#34D399';
const RED = '#F87171';
const MUTED = '#A8A29E';
const WHITE = '#FFFFFF';

export async function generateShareImage(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const metalColor = data.metal === 'gold' ? GOLD_COLOR : SILVER_COLOR;
  const pad = 80;

  // Background
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_SIZE, CARD_SIZE, 48);
  const grad = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
  grad.addColorStop(0, BG_DARK);
  grad.addColorStop(1, BG_DARK2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Metal icon — same bucket icon as the website, drawn at 2.5x scale
  const s = 2.5; // scale factor
  const ix = pad - 2, iy = pad - 5;
  const isGold = data.metal === 'gold';

  // Bucket body
  ctx.beginPath();
  ctx.moveTo(ix + 3 * s, iy + 11 * s);
  ctx.lineTo(ix + 21 * s, iy + 11 * s);
  ctx.lineTo(ix + 19 * s, iy + 21 * s);
  ctx.lineTo(ix + 5 * s, iy + 21 * s);
  ctx.closePath();
  ctx.fillStyle = isGold ? '#EAB308' : '#CBD5E1';
  ctx.fill();
  ctx.strokeStyle = isGold ? '#CA8A04' : '#94A3B8';
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // Bucket rim
  ctx.beginPath();
  ctx.roundRect(ix + 2.5 * s, iy + 10.5 * s, 19 * s, 2 * s, 1 * s);
  ctx.fillStyle = isGold ? '#CA8A04' : '#94A3B8';
  ctx.fill();

  // Balls — back row
  ctx.beginPath();
  ctx.arc(ix + 9 * s, iy + 7.5 * s, 2 * s, 0, Math.PI * 2);
  ctx.fillStyle = isGold ? '#FACC15' : '#E2E8F0';
  ctx.fill();
  ctx.strokeStyle = isGold ? '#CA8A04' : '#94A3B8';
  ctx.lineWidth = 0.75 * s;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(ix + 15 * s, iy + 7.5 * s, 2 * s, 0, Math.PI * 2);
  ctx.fillStyle = isGold ? '#EAB308' : '#CBD5E1';
  ctx.fill();
  ctx.strokeStyle = isGold ? '#A16207' : '#64748B';
  ctx.stroke();

  // Front ball
  ctx.beginPath();
  ctx.arc(ix + 12 * s, iy + 6 * s, 2.2 * s, 0, Math.PI * 2);
  ctx.fillStyle = isGold ? '#FDE047' : '#F1F5F9';
  ctx.fill();
  ctx.strokeStyle = isGold ? '#CA8A04' : '#94A3B8';
  ctx.stroke();

  // Gold bar peeking out
  ctx.beginPath();
  ctx.roundRect(ix + 7 * s, iy + 9 * s, 10 * s, 2.5 * s, 0.5 * s);
  ctx.fillStyle = isGold ? '#FACC15' : '#E2E8F0';
  ctx.fill();

  // Shine
  ctx.beginPath();
  ctx.arc(ix + 11.2 * s, iy + 5.2 * s, 0.6 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fill();

  // "Nepal Bullion"
  ctx.fillStyle = WHITE;
  ctx.font = '600 32px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Nepal Bullion', pad + 22 * s + 16, pad + 34);

  // Date (BS date if available, else Gregorian)
  const displayDate = data.priceDate
    ? data.priceDate.replace(/,\s*\d{4}$/, '')
    : data.date;
  ctx.fillStyle = MUTED;
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(displayDate, CARD_SIZE - pad, pad + 34);
  ctx.textAlign = 'left';

  // Metal label
  const labelY = 220;
  ctx.fillStyle = MUTED;
  ctx.font = '500 22px system-ui, sans-serif';
  ctx.fillText(`${data.metalName.toUpperCase()}`, pad, labelY);

  // Price — the hero
  const priceStr = `Rs ${data.price.toLocaleString(data.numberLocale)}`;
  ctx.fillStyle = metalColor;
  ctx.font = '700 86px ui-monospace, monospace';
  ctx.fillText(priceStr, pad, labelY + 90);

  // Price change — journey format
  if (data.previousPrice != null) {
    const diff = data.price - data.previousPrice;
    if (diff !== 0) {
      const isUp = diff > 0;
      const pct = ((diff / data.previousPrice) * 100).toFixed(1);
      const arrow = isUp ? '▲' : '▼';
      const prevStr = `Rs ${data.previousPrice.toLocaleString(data.numberLocale)}`;
      const currStr = `Rs ${data.price.toLocaleString(data.numberLocale)}`;
      ctx.fillStyle = isUp ? GREEN : RED;
      ctx.font = '400 26px system-ui, sans-serif';
      ctx.fillText(`${arrow} ${prevStr} → ${currStr} (${isUp ? '+' : ''}${pct}%)`, pad, labelY + 135);
    }
  }

  // Sparkline
  if (data.history && data.history.length >= 2) {
    const sparkY = 500;
    const sparkW = CARD_SIZE - pad * 2;
    const sparkH = 150;
    const prices = data.history.map(h => h.price);
    const min = prices.reduce((a, b) => Math.min(a, b), prices[0]);
    const max = prices.reduce((a, b) => Math.max(a, b), prices[0]);
    const range = max - min || 1;

    // Line
    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = pad + (i / (prices.length - 1)) * sparkW;
      const y = sparkY + ((max - p) / range) * sparkH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = metalColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Gradient fill under line
    const lastX = pad + sparkW;
    ctx.lineTo(lastX, sparkY + sparkH);
    ctx.lineTo(pad, sparkY + sparkH);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, sparkY, 0, sparkY + sparkH);
    fillGrad.addColorStop(0, metalColor + '40');
    fillGrad.addColorStop(1, metalColor + '00');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // End dot
    const lastPrice = prices[prices.length - 1];
    const dotX = lastX;
    const dotY = sparkY + ((max - lastPrice) / range) * sparkH;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = metalColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = BG_DARK2;
    ctx.fill();
  }

  // Narrative text
  if (data.narrativeText) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillText(data.narrativeText, pad, 720);
  }

  // Footer divider
  const footerY = CARD_SIZE - 120;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(CARD_SIZE - pad, footerY);
  ctx.strokeStyle = WHITE + '18';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Footer text
  ctx.fillStyle = MUTED;
  ctx.font = '400 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('bullion.pawanpaudel.com.np', pad, footerY + 44);
  ctx.textAlign = 'right';
  ctx.fillText('per tola · FENEGOSIDA', CARD_SIZE - pad, footerY + 44);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate share image'));
    }, 'image/jpeg', 0.9);
  });
}

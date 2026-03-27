interface ShareCardData {
  metal: 'gold' | 'silver';
  metalName: string;
  price: number;
  previousPrice: number | null;
  history: { date: string; price: number }[] | null;
  narrativeText: string;
  numberLocale: string;
  date: string;
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
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
  grad.addColorStop(0, BG_DARK);
  grad.addColorStop(1, BG_DARK2);
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, CARD_SIZE, CARD_SIZE, 48);
  ctx.fill();

  const metalColor = data.metal === 'gold' ? GOLD_COLOR : SILVER_COLOR;
  const pad = 80;

  // Logo placeholder (small rounded square)
  ctx.fillStyle = metalColor;
  ctx.roundRect(pad, pad, 48, 48, 10);
  ctx.fill();

  // "Nepal Bullion" text
  ctx.fillStyle = WHITE;
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.fillText('Nepal Bullion', pad + 64, pad + 34);

  // Date
  ctx.fillStyle = MUTED;
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(data.date, CARD_SIZE - pad, pad + 34);
  ctx.textAlign = 'left';

  // Metal label
  const labelY = 240;
  ctx.fillStyle = MUTED;
  ctx.font = '500 20px system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(`${data.metalName.toUpperCase()} PRICE`, pad, labelY);
  ctx.letterSpacing = '0px';

  // Price
  const priceStr = `Rs ${data.price.toLocaleString(data.numberLocale)}`;
  ctx.fillStyle = metalColor;
  ctx.font = '700 72px ui-monospace, monospace';
  ctx.fillText(priceStr, pad, labelY + 80);

  // Price change
  if (data.previousPrice != null) {
    const diff = data.price - data.previousPrice;
    if (diff !== 0) {
      const isUp = diff > 0;
      const pct = ((diff / data.previousPrice) * 100).toFixed(1);
      const arrow = isUp ? '▲' : '▼';
      const sign = isUp ? '+' : '';
      const changeStr = `${arrow} ${sign}${diff.toLocaleString(data.numberLocale)} (${pct}%) from yesterday`;
      ctx.fillStyle = isUp ? GREEN : RED;
      ctx.font = '400 24px system-ui, sans-serif';
      ctx.fillText(changeStr, pad, labelY + 120);
    }
  }

  // Sparkline
  if (data.history && data.history.length >= 2) {
    const sparkY = 480;
    const sparkW = CARD_SIZE - pad * 2;
    const sparkH = 120;
    const prices = data.history.map(h => h.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    ctx.beginPath();
    prices.forEach((p, i) => {
      const x = pad + (i / (prices.length - 1)) * sparkW;
      const y = sparkY + ((max - p) / range) * sparkH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = metalColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill under line
    ctx.lineTo(pad + sparkW, sparkY + sparkH);
    ctx.lineTo(pad, sparkY + sparkH);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, sparkY, 0, sparkY + sparkH);
    fillGrad.addColorStop(0, metalColor + '33');
    fillGrad.addColorStop(1, metalColor + '00');
    ctx.fillStyle = fillGrad;
    ctx.fill();
  }

  // Narrative text
  if (data.narrativeText) {
    ctx.fillStyle = MUTED;
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillText(data.narrativeText, pad, 680);
  }

  // Footer divider
  const footerY = CARD_SIZE - 120;
  ctx.strokeStyle = WHITE + '14';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(CARD_SIZE - pad, footerY);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = MUTED;
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillText('bullion.pawanpaudel.com.np', pad, footerY + 40);
  ctx.textAlign = 'right';
  ctx.fillText('per tola · FENEGOSIDA', CARD_SIZE - pad, footerY + 40);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate share image'));
    }, 'image/png');
  });
}

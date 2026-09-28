const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_NE = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Format a YYYY-MM-DD date as "Sep 27" (or "सेप्टेम्बर 27" in Nepali — digits are
 * localized separately). Returns the input unchanged if it isn't an ISO date.
 */
export function formatShortDate(iso: string, lang: 'en' | 'ne' = 'en'): string {
  const m = iso.match(ISO_DATE);
  if (!m) return iso;
  const month = (lang === 'ne' ? MONTHS_NE : MONTHS_EN)[parseInt(m[2], 10) - 1];
  return month ? `${month} ${parseInt(m[3], 10)}` : iso;
}

/** Today's date in Nepal (YYYY-MM-DD). */
export function nepalToday(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
}

/** True if it's Saturday in Nepal — the weekly market holiday, no new rate is published. */
export function isNepalSaturday(now: Date = new Date()): boolean {
  return now.toLocaleDateString('en-US', { timeZone: 'Asia/Kathmandu', weekday: 'short' }) === 'Sat';
}

export type RateFreshness = 'today' | 'pending' | 'holiday' | 'unknown';

/**
 * How current a published rate is:
 * - today:   published today
 * - pending: today's rate not out yet (FENEGOSIDA publishes around 11 AM NPT)
 * - holiday: Saturday, no rate is published today
 * - unknown: no publication date available
 */
export function getRateFreshness(priceDate: string | null | undefined, now: Date = new Date()): RateFreshness {
  if (!priceDate || !ISO_DATE.test(priceDate)) return 'unknown';
  if (priceDate >= nepalToday(now)) return 'today';
  return isNepalSaturday(now) ? 'holiday' : 'pending';
}

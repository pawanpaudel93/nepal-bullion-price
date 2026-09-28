import { describe, it, expect } from 'vitest';
import { buildHistory, toNptDate } from '../providers/nepal-price/fenegosida.js';
import { extractSegment } from '../providers/nepal-price/hamropatro.js';
import { parseAsheshDate } from '../providers/nepal-price/ashesh.js';

const entry = (date: string, day: string, tola: number) => ({
  date, year: '2026', month: 'Sep', day, gm: 0, tola,
});

describe('fenegosida buildHistory', () => {
  const chart = [
    entry('21', 'Monday', 303900),
    entry('22', 'Tuesday', 302200),
    entry('25', 'Friday', 298600),
    entry('26', 'Saturday', 298600), // forward-filled holiday
    entry('27', 'Sunday', 299300),
    entry('28', 'Monday', 299300), // forward-filled, not yet published
  ];

  it('converts chart entries to ISO-dated trading days', () => {
    const result = buildHistory(chart, '2026-09-27');
    expect(result).toEqual([
      { date: '2026-09-21', price: 303900 },
      { date: '2026-09-22', price: 302200 },
      { date: '2026-09-25', price: 298600 },
      { date: '2026-09-27', price: 299300 },
    ]);
  });

  it('keeps today once it has been published', () => {
    const result = buildHistory(chart, '2026-09-28');
    expect(result!.at(-1)).toEqual({ date: '2026-09-28', price: 299300 });
  });

  it('returns null with fewer than 2 points', () => {
    expect(buildHistory([entry('21', 'Monday', 303900)], '2026-09-27')).toBeNull();
    expect(buildHistory([], '2026-09-27')).toBeNull();
  });

  it('drops zero prices', () => {
    const result = buildHistory([entry('21', 'Monday', 0), entry('22', 'Tuesday', 1), entry('23', 'Wednesday', 2)], '2026-09-30');
    expect(result).toHaveLength(2);
  });
});

describe('toNptDate', () => {
  it('uses the Nepal calendar day', () => {
    // 20:00 UTC is 01:45 the next day in Nepal (UTC+5:45)
    expect(toNptDate('2026-09-27T20:00:00Z')).toBe('2026-09-28');
    expect(toNptDate('2026-09-27T04:39:41.682+00:00')).toBe('2026-09-27');
  });
});

describe('hamropatro extractSegment', () => {
  const segment = {
    name: 'Gold-Silver Price',
    date: '2026-09-27',
    items: [
      { name: 'Silver', symbol: 'SILVER', prices: [{ name: '1 tola', price: { date: '2026-09-27', price: 4655 }, history: [] }] },
      { name: 'HalMark Gold', symbol: 'HALMARK', prices: [{ name: '1 tola', price: { date: '2026-09-27', price: 299300 }, history: [] }] },
    ],
  };
  const flight = `f:["$","main",null,{"children":["$","$L55",null,{"enSegment":${JSON.stringify(segment)},"npSegment":{}}]}]`;
  // Split across two push() chunks, as Next.js does, to exercise re-joining.
  const mid = Math.floor(flight.length / 2);
  const html = [flight.slice(0, mid), flight.slice(mid)]
    .map(c => `<script>self.__next_f.push([1,${JSON.stringify(c)}])</script>`)
    .join('');

  it('extracts the English segment from RSC payload chunks', () => {
    expect(extractSegment(html)).toEqual(segment);
  });

  it('returns null when the payload is missing', () => {
    expect(extractSegment('<html></html>')).toBeNull();
  });
});

describe('parseAsheshDate', () => {
  it('parses DD-Mon-YYYY', () => {
    expect(parseAsheshDate('27-Sep-2026')).toBe('2026-09-27');
    expect(parseAsheshDate(' 3-Jan-2027 ')).toBe('2027-01-03');
  });

  it('parses ISO dates', () => {
    expect(parseAsheshDate('2026-09-27')).toBe('2026-09-27');
  });

  it('returns null for unknown formats', () => {
    expect(parseAsheshDate('Asoj 11')).toBeNull();
  });
});

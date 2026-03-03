import { describe, it, expect, vi } from 'vitest';
import { enrichItemsWithDetails } from '../../src/utils/enrichment.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

type Item = { id: string; name?: string; score?: number };
type Detail = { name: string; score: number };

const makeItem = (id: string, name?: string): Item => ({ id, name });

const alwaysEnrich = (_item: Item) => true;
const neverEnrich = (_item: Item) => false;
const enrichIfNoName = (item: Item) => !item.name;

const makeFetcher =
  (details: Record<string, Detail>) =>
  async (item: Item): Promise<Detail> => {
    const detail = details[item.id];
    if (!detail) throw new Error(`No detail for ${item.id}`);
    return detail;
  };

// ─── enrichItemsWithDetails ──────────────────────────────────────────────────

describe('enrichItemsWithDetails', () => {
  it('returns original items unchanged when shouldEnrich returns false for all', async () => {
    const items = [makeItem('1', 'Alice'), makeItem('2', 'Bob')];
    const result = await enrichItemsWithDetails(
      items,
      async () => ({ name: 'X', score: 0 }),
      neverEnrich
    );
    expect(result).toEqual(items);
    expect(result).toBe(items); // same reference — no copying
  });

  it('returns original array reference when no candidates qualify', async () => {
    const items: Item[] = [];
    const result = await enrichItemsWithDetails(
      items,
      async () => ({ name: 'X', score: 0 }),
      alwaysEnrich
    );
    expect(result).toEqual([]);
  });

  it('enriches weak items by merging fetched details', async () => {
    const items = [makeItem('1'), makeItem('2', 'Named')];
    const fetcher = makeFetcher({ '1': { name: 'Fetched', score: 42 } });

    const result = await enrichItemsWithDetails(items, fetcher, enrichIfNoName);

    expect(result[0]).toEqual({ id: '1', name: 'Fetched', score: 42 });
    expect(result[1]).toEqual({ id: '2', name: 'Named' }); // untouched
  });

  it('does not mutate original items array', async () => {
    const items = [makeItem('1'), makeItem('2')];
    const original = [...items];
    const fetcher = makeFetcher({
      '1': { name: 'A', score: 1 },
      '2': { name: 'B', score: 2 },
    });

    await enrichItemsWithDetails(items, fetcher, alwaysEnrich);
    expect(items).toEqual(original);
  });

  it('preserves item properties not overridden by detail', async () => {
    const items: Array<{ id: string; name?: string; score?: number; extra: string }> = [
      { id: '1', extra: 'keep-me' },
    ];
    const fetcher = async (_item: { id: string }) => ({ name: 'Enriched', score: 99 });

    const result = await enrichItemsWithDetails(items, fetcher, item => !item.name);

    expect(result[0]).toMatchObject({ id: '1', extra: 'keep-me', name: 'Enriched', score: 99 });
  });

  it('keeps failed enrichments at original value', async () => {
    const items = [makeItem('1'), makeItem('2')];
    const fetcher = async (item: Item): Promise<Detail> => {
      if (item.id === '1') throw new Error('API down');
      return { name: 'Success', score: 5 };
    };

    const result = await enrichItemsWithDetails(items, fetcher, alwaysEnrich);

    // item '1' fetch failed — should retain original
    expect(result[0]).toEqual(makeItem('1'));
    // item '2' succeeded
    expect(result[1]).toMatchObject({ id: '2', name: 'Success', score: 5 });
  });

  it('only enriches up to maxLookups items', async () => {
    const items = Array.from({ length: 15 }, (_, i) => makeItem(String(i)));
    const fetchCount = { n: 0 };
    const fetcher = async (item: Item): Promise<Detail> => {
      fetchCount.n += 1;
      return { name: `Fetched-${item.id}`, score: fetchCount.n };
    };

    await enrichItemsWithDetails(items, fetcher, alwaysEnrich, 10);

    expect(fetchCount.n).toBe(10);
  });

  it('respects default maxLookups of 10', async () => {
    const items = Array.from({ length: 20 }, (_, i) => makeItem(String(i)));
    const fetchCount = { n: 0 };
    const fetcher = async (item: Item): Promise<Detail> => {
      fetchCount.n += 1;
      return { name: `Fetched-${item.id}`, score: fetchCount.n };
    };

    await enrichItemsWithDetails(items, fetcher, alwaysEnrich);

    expect(fetchCount.n).toBe(10);
  });

  it('enriches only items where shouldEnrich returns true', async () => {
    const items = [
      makeItem('1'), // weak — no name
      makeItem('2', 'Bob'), // strong — has name
      makeItem('3'), // weak — no name
    ];
    const fetcher = makeFetcher({
      '1': { name: 'Alice', score: 1 },
      '3': { name: 'Carol', score: 3 },
    });

    const result = await enrichItemsWithDetails(items, fetcher, enrichIfNoName);

    expect(result[0]).toMatchObject({ name: 'Alice' });
    expect(result[1]).toMatchObject({ name: 'Bob' }); // unchanged
    expect(result[2]).toMatchObject({ name: 'Carol' });
  });

  it('handles all fetches failing gracefully', async () => {
    const items = [makeItem('1'), makeItem('2')];
    const fetcher = async (): Promise<Detail> => {
      throw new Error('total failure');
    };

    const result = await enrichItemsWithDetails(items, fetcher, alwaysEnrich);

    // all originals preserved
    expect(result[0]).toEqual(makeItem('1'));
    expect(result[1]).toEqual(makeItem('2'));
  });

  it('uses numeric ids correctly', async () => {
    const items: Array<{ id: number; name?: string }> = [{ id: 1 }, { id: 2, name: 'Named' }];
    const fetcher = async (item: { id: number }) => ({
      name: `Item-${item.id}`,
      score: item.id * 10,
    });

    const result = await enrichItemsWithDetails(items, fetcher, item => !item.name);

    expect(result[0]).toMatchObject({ id: 1, name: 'Item-1', score: 10 });
    expect(result[1]).toMatchObject({ id: 2, name: 'Named' });
  });

  it('maxLookups of 0 enriches nothing', async () => {
    const items = [makeItem('1'), makeItem('2')];
    const fetchCount = { n: 0 };
    const fetcher = async (): Promise<Detail> => {
      fetchCount.n += 1;
      return { name: 'X', score: 0 };
    };

    const result = await enrichItemsWithDetails(items, fetcher, alwaysEnrich, 0);

    expect(fetchCount.n).toBe(0);
    expect(result).toEqual(items);
  });

  it('result array has same length as input', async () => {
    const items = Array.from({ length: 5 }, (_, i) => makeItem(String(i)));
    const fetcher = async (item: Item): Promise<Detail> => ({ name: `N-${item.id}`, score: 0 });

    const result = await enrichItemsWithDetails(items, fetcher, alwaysEnrich);

    expect(result).toHaveLength(5);
  });

  it('calls fetchDetails only for qualifying items', async () => {
    const items = [makeItem('1', 'Named'), makeItem('2'), makeItem('3', 'AlsoNamed')];
    const spy = vi.fn().mockResolvedValue({ name: 'Enriched', score: 0 });

    await enrichItemsWithDetails(items, spy, enrichIfNoName);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(makeItem('2'));
  });
});

export async function enrichItemsWithDetails<
  TItem extends { id: string | number },
  TDetail extends object,
>(
  items: TItem[],
  fetchDetails: (item: TItem) => Promise<TDetail>,
  shouldEnrich: (item: TItem) => boolean,
  maxLookups: number = 10
): Promise<TItem[]> {
  const candidates = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => shouldEnrich(item))
    .slice(0, maxLookups);

  if (candidates.length === 0) {
    return items;
  }

  const enriched = [...items];
  const results = await Promise.allSettled(candidates.map(({ item }) => fetchDetails(item)));

  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    const candidate = candidates[i];
    if (!candidate || !result || result.status !== 'fulfilled') {
      continue;
    }

    enriched[candidate.index] = {
      ...candidate.item,
      ...result.value,
    };
  }

  return enriched;
}

type WatchlistItem = {
  id: string;
  symbol: string;
  lastPrice: number;
  change: number;
};

let watchlist: WatchlistItem[] = [
  { id: '1', symbol: 'ASELS', lastPrice: 45.2, change: 1.1 },
  { id: '2', symbol: 'THYAO', lastPrice: 302.5, change: -0.8 },
];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getWatchlist(): Promise<WatchlistItem[]> {
  await delay();
  return watchlist;
}

export async function addToWatchlist(symbol: string): Promise<WatchlistItem> {
  await delay();
  const newItem: WatchlistItem = {
    id: crypto.randomUUID(),
    symbol: symbol.toUpperCase(),
    lastPrice: Number((Math.random() * 100 + 20).toFixed(2)),
    change: Number((Math.random() * 4 - 2).toFixed(2)),
  };
  watchlist = [newItem, ...watchlist];
  return newItem;
}

export async function removeFromWatchlist(id: string): Promise<{ success: boolean }> {
  await delay();
  watchlist = watchlist.filter((item) => item.id !== id);
  return { success: true };
}


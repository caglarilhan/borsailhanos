'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/shared/Card';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '@/services/watchlist';

export default function WatchlistPage() {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
  });

  const addMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setSymbol('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!symbol.trim()) return;
    addMutation.mutate(symbol.trim());
  };

  return (
    <div className="col-span-12 space-y-6">
      <Card
        title="📋 Watchlist"
        subtitle="Favori sembollerini tek ekranda takip et"
        actions={
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Sembol (örn. ASELS)"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Ekle
            </button>
          </form>
        }
      >
        {isLoading ? (
          <p className="text-sm text-slate-500">Watchlist yükleniyor...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[520px] text-sm text-slate-700">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Sembol</th>
                  <th className="px-3 py-2">Fiyat</th>
                  <th className="px-3 py-2">Değişim</th>
                  <th className="px-3 py-2 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-semibold text-slate-900">{row.symbol}</td>
                    <td className="px-3 py-3">₺{row.lastPrice.toFixed(2)}</td>
                    <td className={`px-3 py-3 ${row.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.change >= 0 ? '+' : ''}
                      {row.change.toFixed(2)}%
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(row.id)}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Kaldır
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}


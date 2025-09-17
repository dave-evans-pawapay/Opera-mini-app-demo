import { useEffect, useMemo, useState } from 'react';
import { listMerchants } from '../lib/api';
import type { Merchant } from '../types';

type Props = {
  onSelect: (merchant: Merchant) => void;
};

export default function MerchantSelect({ onSelect }: Props) {
  const [items, setItems] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    listMerchants()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => item.name.toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0 }}>Select a merchant</h2>
      <input
        placeholder="Search merchants"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <p style={{ color: '#666' }}>Loading merchants…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && <p style={{ color: '#666' }}>No merchants found.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {filtered.map((merchant) => (
          <li key={merchant.id}>
            <button
              type="button"
              onClick={() => onSelect(merchant)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {merchant.logoUrl && (
                <img
                  src={merchant.logoUrl}
                  alt={merchant.name}
                  width={32}
                  height={32}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{merchant.name}</div>
                {merchant.country && <div style={{ fontSize: 12, color: '#777' }}>{merchant.country}</div>}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

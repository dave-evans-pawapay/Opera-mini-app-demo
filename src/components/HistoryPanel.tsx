import { useCallback, useEffect, useState } from 'react';
import { listPayments } from '../lib/api';
import type { PaymentRecord } from '../types';

type Props = {
  refreshToken: number;
  limit?: number;
};

const STATUS_COLORS: Record<string, string> = {
  success: '#1b5e20',
  pending: '#ff9800',
  failed: '#b71c1c',
};

const formatAmount = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

export default function HistoryPanel({ refreshToken, limit = 10 }: Props) {
  const [items, setItems] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPayments(limit);
      setItems(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  return (
    <section style={{ marginTop: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Recent payments</h3>
        <button type="button" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!error && items.length === 0 && !loading && <p style={{ color: '#555' }}>No payments yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {items.map((item) => {
          const statusColor = STATUS_COLORS[item.status] ?? '#2e7d32';
          return (
            <li
              key={item.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 12,
                padding: 12,
                display: 'grid',
                gap: 6,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.merchantName}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>{item.reference}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700 }}>{item.stableAmount.toFixed(2)} {item.stablecoin}</span>
                  <div style={{ fontSize: 12, color: '#666' }}>{formatAmount(item.localAmount, item.localCurrency)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555' }}>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span style={{ color: statusColor, fontWeight: 600 }}>{item.status.toUpperCase()}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

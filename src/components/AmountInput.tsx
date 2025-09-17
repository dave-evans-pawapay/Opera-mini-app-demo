import { useEffect, useMemo, useState } from 'react';
import { fetchQuote } from '../lib/rates';
import type { Quote, StablecoinCode } from '../types';

type Props = {
  localCurrency: string;
  onQuote: (quote: Quote | null) => void;
  defaultStablecoin?: StablecoinCode;
};

const STABLECOIN_LABEL: Record<StablecoinCode, string> = {
  cUSD: 'cUSD (Celo Dollar)',
  USDC: 'USDC',
};

type Mode = 'local' | 'stable';

const formatStable = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AmountInput({ localCurrency, onQuote, defaultStablecoin = 'cUSD' }: Props) {
  const [mode, setMode] = useState<Mode>('local');
  const [localValue, setLocalValue] = useState('');
  const [stableValue, setStableValue] = useState('');
  const [stablecoin, setStablecoin] = useState<StablecoinCode>(defaultStablecoin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const localFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: localCurrency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (err) {
      console.warn('Unable to build currency formatter', err);
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, [localCurrency]);

  useEffect(() => {
    setError(null);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'local') return;
    if (!localValue) {
      setQuote(null);
      onQuote(null);
      setStableValue('');
      return;
    }
    const numeric = Number(localValue);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter an amount greater than zero.');
      setQuote(null);
      onQuote(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetchQuote({ localAmount: numeric, localCurrency, stablecoin }, { signal: controller.signal })
      .then((result) => {
        setQuote(result);
        setStableValue(formatStable(result.stableAmount));
        setError(null);
        onQuote(result);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
        setQuote(null);
        onQuote(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      setLoading(false);
    };
  }, [mode, localValue, stablecoin, localCurrency, onQuote]);

  useEffect(() => {
    if (mode !== 'stable') return;
    if (!stableValue) {
      setQuote(null);
      onQuote(null);
      setLocalValue('');
      return;
    }
    const numeric = Number(stableValue);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError('Enter an amount greater than zero.');
      setQuote(null);
      onQuote(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetchQuote({ stableAmount: numeric, localCurrency, stablecoin }, { signal: controller.signal })
      .then((result) => {
        setQuote(result);
        setLocalValue(result.localAmount.toFixed(2));
        setError(null);
        onQuote(result);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
        setQuote(null);
        onQuote(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      setLoading(false);
    };
  }, [mode, stableValue, stablecoin, localCurrency, onQuote]);

  const handleModeChange = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    if (next === 'local' && quote) {
      setLocalValue(quote.localAmount.toFixed(2));
    }
    if (next === 'stable' && quote) {
      setStableValue(formatStable(quote.stableAmount));
    }
  };

  const clearQuote = () => {
    setQuote(null);
    onQuote(null);
    setError(null);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        <span style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Enter amount in</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => handleModeChange('local')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: mode === 'local' ? '#ff4b4b' : '#d0d0d0',
              background: mode === 'local' ? '#ffeaea' : '#fff',
              fontWeight: mode === 'local' ? 700 : 500,
            }}
          >
            {localCurrency}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('stable')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: mode === 'stable' ? '#ff4b4b' : '#d0d0d0',
              background: mode === 'stable' ? '#ffeaea' : '#fff',
              fontWeight: mode === 'stable' ? 700 : 500,
            }}
          >
            Stablecoin
          </button>
        </div>
      </div>

      {mode === 'local' ? (
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Local amount ({localCurrency})</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              if (!e.target.value) clearQuote();
            }}
            inputMode="decimal"
          />
        </label>
      ) : (
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Stablecoin amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={stableValue}
            onChange={(e) => {
              setStableValue(e.target.value);
              if (!e.target.value) clearQuote();
            }}
            inputMode="decimal"
          />
        </label>
      )}

      <label style={{ display: 'grid', gap: 4 }}>
        <span>Stablecoin</span>
        <select
          value={stablecoin}
          onChange={(e) => {
            const coin = e.target.value as StablecoinCode;
            setStablecoin(coin);
            if (quote) {
              // Force refresh using the existing amount for the newly selected stablecoin
              if (mode === 'local') {
                setLocalValue(quote.localAmount.toFixed(2));
              } else {
                setStableValue(formatStable(quote.stableAmount));
              }
            }
          }}
        >
          {Object.entries(STABLECOIN_LABEL).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {loading && <p style={{ color: '#666', margin: 0 }}>Fetching live quote…</p>}
      {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}

      {!loading && quote && !error && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12, background: '#fafafa' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>
            {localFormatter.format(quote.localAmount)} ≈ {formatStable(quote.stableAmount)} {quote.stablecoin}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#333' }}>
            Rate: {quote.rate.toFixed(6)} • Fees: {localFormatter.format(quote.fees)}
          </p>
          {quote.expiresAt && (
            <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#777' }}>
              Quote valid until {new Date(quote.expiresAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

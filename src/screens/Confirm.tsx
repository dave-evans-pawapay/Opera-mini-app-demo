import { useMemo, useState } from 'react';
import WalletBalanceBanner from '../components/WalletBalanceBanner';
import type { PaymentReview, WalletBalances } from '../types';

type Props = {
  draft: PaymentReview;
  balances: WalletBalances;
  onConfirm: () => Promise<void>;
  onBack: () => void;
};

const formatNumber = (value: number, fractionDigits = 2) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export default function Confirm({ draft, balances, onConfirm, onBack }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFunds = useMemo(() => {
    const balance = balances[draft.stablecoin] ?? 0;
    return balance >= draft.stableAmount - 1e-6;
  }, [balances, draft.stableAmount, draft.stablecoin]);

  const localFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: draft.localCurrency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, [draft.localCurrency]);

  const handleConfirm = async () => {
    if (!hasFunds || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header>
        <h2 style={{ margin: '0 0 8px 0' }}>Review &amp; confirm</h2>
        <p style={{ margin: 0, color: '#444' }}>Please confirm the details below before sending.</p>
      </header>

      <section style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Merchant</span>
          <strong>{draft.merchant.name}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Reference</span>
          <strong>{draft.reference}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>MSISDN</span>
          <strong>{draft.msisdn}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Amount</span>
          <strong>
            {localFormatter.format(draft.localAmount)} ≈ {formatNumber(draft.stableAmount)} {draft.stablecoin}
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Fees</span>
          <strong>{localFormatter.format(draft.fees)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Exchange rate</span>
          <strong>{draft.rate.toFixed(6)}</strong>
        </div>
      </section>

      <WalletBalanceBanner
        balances={balances}
        stablecoin={draft.stablecoin}
        required={draft.stableAmount}
      />

      {error && <p style={{ color: 'crimson', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} disabled={submitting} style={{ flex: 1 }}>
          Back
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={!hasFunds || submitting}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 12,
            border: 'none',
            background: !hasFunds ? '#ffd7d7' : submitting ? '#ff8c8c' : '#ff4b4b',
            color: !hasFunds ? '#7f7f7f' : '#fff',
            fontWeight: 700,
          }}
        >
          {submitting ? 'Processing…' : 'Confirm & pay'}
        </button>
      </div>
    </div>
  );
}

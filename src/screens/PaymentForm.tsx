import { useMemo, useState } from 'react';
import type { Merchant, PaymentReview, Quote, WalletBalances } from '../types';
import PhoneInput from '../components/phoneinput';
import AmountInput from '../components/AmountInput';
import WalletBalanceBanner from '../components/WalletBalanceBanner';

type Props = {
  merchant: Merchant;
  balances: WalletBalances;
  onReady: (draft: PaymentReview) => void;
  defaultMsisdn?: string;
  localCurrency?: string;
};

const DEFAULT_LOCAL_CURRENCY = 'RWF';

export default function PaymentForm({
  merchant,
  balances,
  onReady,
  defaultMsisdn,
  localCurrency = DEFAULT_LOCAL_CURRENCY,
}: Props) {
  const [reference, setReference] = useState('');
  const [msisdn, setMsisdn] = useState(defaultMsisdn ?? '');
  const [msisdnError, setMsisdnError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const canContinue = useMemo(() => {
    return Boolean(reference.trim() && quote && msisdn && !msisdnError);
  }, [reference, quote, msisdn, msisdnError]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header>
        <h2 style={{ margin: '0 0 8px 0' }}>Payment details</h2>
        <p style={{ margin: 0, color: '#444' }}>
          Paying <strong>{merchant.name}</strong>
        </p>
      </header>

      <label style={{ display: 'grid', gap: 4 }}>
        <span>Payment reference</span>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Invoice / Order / Note"
        />
      </label>

      <AmountInput
        localCurrency={localCurrency}
        onQuote={(value) => setQuote(value)}
      />

      <WalletBalanceBanner
        balances={balances}
        stablecoin={quote?.stablecoin ?? 'cUSD'}
        required={quote?.stableAmount ?? null}
      />

      <PhoneInput
        onValid={(value) => {
          setMsisdn(value);
          setMsisdnError(null);
        }}
        onInvalid={(message) => {
          setMsisdn('');
          setMsisdnError(message || null);
        }}
        defaultCountry={merchant.country ?? 'RW'}
        initialValue={defaultMsisdn}
      />

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => {
          if (!quote) return;
          onReady({
            merchantId: merchant.id,
            reference: reference.trim(),
            localAmount: quote.localAmount,
            localCurrency: quote.localCurrency,
            stableAmount: quote.stableAmount,
            stablecoin: quote.stablecoin,
            msisdn,
            rate: quote.rate,
            fees: quote.fees,
            quote,
            merchant,
          });
        }}
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          background: canContinue ? '#ff4b4b' : '#ffd7d7',
          color: canContinue ? '#fff' : '#7f7f7f',
          fontWeight: 700,
        }}
      >
        Review payment
      </button>
    </div>
  );
}

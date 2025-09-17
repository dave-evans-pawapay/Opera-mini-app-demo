import { useState } from 'react';
import MerchantSelect from './screens/MerchantSelect';
import PaymentForm from './screens/PaymentForm';
import Confirm from './screens/Confirm';
import Receipt from './screens/Receipt';
import HistoryPanel from './components/HistoryPanel';
import { createPayment } from './lib/api';
import { useWallet } from './lib/wallet';
import type { Merchant, PaymentReview, TxReceipt } from './types';

export default function App() {
  const wallet = useWallet();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [draft, setDraft] = useState<PaymentReview | null>(null);
  const [receipt, setReceipt] = useState<TxReceipt | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const resetFlow = () => {
    setDraft(null);
    setReceipt(null);
    setMerchant(null);
  };

  const handleConfirm = async () => {
    if (!draft) return;
    const { quote: _quote, merchant: _merchant, ...payload } = draft;
    const result = await createPayment(payload);
    wallet.adjustBalance(payload.stablecoin, -payload.stableAmount);
    setReceipt(result);
    setHistoryVersion((v) => v + 1);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 16, display: 'grid', gap: 32 }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>MiniPay merchant payments</h1>
        <p style={{ margin: 0, color: '#555' }}>
          Pay trusted merchants instantly with stablecoins and keep a full receipt trail.
        </p>
      </header>

      <main style={{ border: '1px solid #eee', borderRadius: 16, padding: 20, background: '#fff', display: 'grid', gap: 20 }}>
        {!merchant && !receipt && (
          <MerchantSelect onSelect={(item) => { setMerchant(item); setDraft(null); }} />
        )}

        {merchant && !draft && !receipt && (
          <PaymentForm
            merchant={merchant}
            balances={wallet.balances}
            onReady={(nextDraft) => setDraft(nextDraft)}
            defaultMsisdn={merchant.msisdn}
          />
        )}

        {merchant && draft && !receipt && (
          <Confirm
            draft={draft}
            balances={wallet.balances}
            onBack={() => setDraft(null)}
            onConfirm={handleConfirm}
          />
        )}

        {receipt && (
          <Receipt
            receipt={receipt}
            onDone={() => {
              resetFlow();
            }}
          />
        )}

        {merchant && !receipt && (
          <button type="button" onClick={resetFlow} style={{ justifySelf: 'start' }}>
            {draft ? 'Cancel payment' : 'Change merchant'}
          </button>
        )}
      </main>

      <HistoryPanel refreshToken={historyVersion} />
    </div>
  );
}

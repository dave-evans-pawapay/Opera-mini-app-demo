import { useState } from 'react';
import MerchantSelect from './screens/MerchantSelect';
import PaymentForm from './screens/PaymentForm';
import Confirm from './screens/Confirm';
import Receipt from './screens/Receipt';
import { createPayment } from './lib/api';
import type { Merchant, TxReceipt } from './types';

export default function App() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [draft, setDraft] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<TxReceipt | null>(null);
  return (
    <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
      {!merchant && <MerchantSelect onSelect={setMerchant} />}
      {merchant && !draft && <PaymentForm merchant={merchant} onReady={setDraft} />}
      {merchant && draft && !receipt && (
        <Confirm
          draft={draft}
          onBack={()=>setDraft(null)}
          onConfirm={async ()=>{
            const r = await createPayment({
              merchantId: draft.merchantId,
              reference: draft.reference,
              localAmount: draft.localAmount,
              stableAmount: draft.stableAmount,
              stablecoin: draft.stablecoin,
              msisdn: draft.msisdn
            });
            setReceipt(r);
          }}
        />
      )}
      {receipt && <Receipt receipt={receipt} onDone={()=>{ setMerchant(null); setDraft(null); setReceipt(null); }} />}
    </div>
  );
}
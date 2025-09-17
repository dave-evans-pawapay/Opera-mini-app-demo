import { useState } from 'react';
import type { Merchant, PaymentDraft } from '../types';
import PhoneInput from '../components/PhoneInput';
import AmountInput from '../components/AmountInput';

export default function PaymentForm({ merchant, onReady }:{ merchant: Merchant; onReady:(draft: PaymentDraft & {quote:any})=>void }) {
  const [reference, setReference] = useState('');
  const [msisdn, setMsisdn] = useState('');
  const [quote, setQuote] = useState<any | null>(null);

  const canContinue = reference && msisdn && quote;

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Merchant: <strong>{merchant.name}</strong></p>
      <label>Reference</label>
      <input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Invoice / Order / Note" />
      <AmountInput localCurrency="RWF" onQuote={setQuote} />
      <PhoneInput onValid={setMsisdn} defaultCountry="RW" />
      <button disabled={!canContinue} onClick={()=>{
        onReady({
          merchantId: merchant.id,
          reference,
          localAmount: quote.localAmount,
          stableAmount: quote.stableAmount,
          stablecoin: quote.stablecoin,
          msisdn,
          quote
        });
      }}>Review</button>
    </div>
  );
}
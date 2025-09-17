import type { PaymentDraft, TxReceipt, Merchant } from '../types';

export async function listMerchants(): Promise<Merchant[]> {
  const res = await fetch('/api/merchants');
  if (!res.ok) throw new Error('Failed to load merchants');
  return res.json();
}

export async function createPayment(draft: PaymentDraft): Promise<TxReceipt> {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
import type {
  Merchant,
  PaymentDraft,
  PaymentRecord,
  PaymentStatus,
  StablecoinCode,
  TxReceipt,
} from '../types';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  return res.json();
};

const mapMerchant = (data: any): Merchant => ({
  id: String(data.id),
  name: String(data.name),
  logoUrl: data.logoUrl ?? data.logo_url ?? undefined,
  msisdn: data.msisdn ? String(data.msisdn) : undefined,
  country: data.country ? String(data.country) : undefined,
});

const toPaymentStatus = (value: any): PaymentStatus => {
  const normalized = String(value ?? 'success').toLowerCase();
  if (normalized === 'pending' || normalized === 'failed' || normalized === 'success') {
    return normalized;
  }
  return 'success';
};

const mapReceipt = (data: any): TxReceipt => {
  const stablecoin = String(data.stablecoin ?? 'cUSD') as StablecoinCode;
  return {
    txId: String(data.txId ?? data.tx_id ?? ''),
    merchantName: String(data.merchantName ?? data.merchant_name ?? ''),
    reference: String(data.reference ?? ''),
    localAmount: Number(data.localAmount ?? data.local_amount ?? 0),
    localCurrency: String(data.localCurrency ?? data.local_currency ?? 'RWF'),
    stableAmount: Number(data.stableAmount ?? data.stable_amount ?? 0),
    stablecoin,
    msisdn: String(data.msisdn ?? ''),
    fees: Number(data.fees ?? 0),
    rate: Number(data.rate ?? 0),
    status: toPaymentStatus(data.status),
    createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
  };
};

const mapRecord = (data: any): PaymentRecord => ({
  ...mapReceipt(data),
  id: String(data.id ?? data.paymentId ?? data.txId ?? `payment-${Math.random().toString(36).slice(2)}`),
});

export async function listMerchants(): Promise<Merchant[]> {
  const data = await handleResponse(await fetch('/api/merchants'));
  return Array.isArray(data) ? data.map(mapMerchant) : [];
}

export async function listPayments(limit = 10): Promise<PaymentRecord[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const data = await handleResponse(await fetch(`/api/payments?${params.toString()}`));
  if (!Array.isArray(data)) return [];
  return data.map(mapRecord);
}

export async function createPayment(draft: PaymentDraft): Promise<TxReceipt> {
  const payload: PaymentDraft = {
    ...draft,
    localAmount: Number(draft.localAmount),
    stableAmount: Number(draft.stableAmount),
    fees: Number(draft.fees),
    rate: Number(draft.rate),
  };
  const data = await handleResponse(
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
  return mapReceipt(data);
}

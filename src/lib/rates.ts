import type { Quote, StablecoinCode } from '../types';

export type QuoteRequest = {
  localAmount?: number;
  stableAmount?: number;
  localCurrency: string;
  stablecoin: StablecoinCode;
};

const validateAmount = (value?: number) => typeof value === 'number' && Number.isFinite(value) && value > 0;

export async function fetchQuote(request: QuoteRequest, options?: { signal?: AbortSignal }): Promise<Quote> {
  const { localAmount, stableAmount, localCurrency, stablecoin } = request;
  if (!validateAmount(localAmount) && !validateAmount(stableAmount)) {
    throw new Error('Enter an amount greater than zero.');
  }

  const params = new URLSearchParams();
  params.set('localCurrency', localCurrency);
  params.set('stable', stablecoin);
  if (validateAmount(localAmount)) params.set('localAmount', String(localAmount));
  if (validateAmount(stableAmount)) params.set('stableAmount', String(stableAmount));

  const res = await fetch(`/api/payments/quote?${params.toString()}`, { signal: options?.signal });
  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || 'Unable to fetch quote right now.');
  }
  const data = await res.json();
  const quote: Quote = {
    stablecoin: String(data.stablecoin ?? stablecoin) as StablecoinCode,
    localAmount: Number(data.localAmount ?? localAmount ?? 0),
    localCurrency: String(data.localCurrency ?? localCurrency),
    stableAmount: Number(data.stableAmount ?? stableAmount ?? 0),
    rate: Number(data.rate ?? 0),
    fees: Number(data.fees ?? 0),
    expiresAt: data.expiresAt ? String(data.expiresAt) : undefined,
  };

  if (
    !validateAmount(quote.localAmount) ||
    !validateAmount(quote.stableAmount) ||
    !Number.isFinite(quote.rate)
  ) {
    throw new Error('Received an invalid quote. Please try again.');
  }

  return quote;
}

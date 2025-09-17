const RATE_TABLE = {
  cUSD: 0.0008,
  USDC: 0.00079,
} as const;

type QuoteInput = {
  localAmount?: number;
  stableAmount?: number;
  localCurrency: string;
  stablecoin: 'cUSD' | 'USDC';
};

type QuoteResult = {
  localAmount: number;
  localCurrency: string;
  stableAmount: number;
  stablecoin: 'cUSD' | 'USDC';
  rate: number;
  fees: number;
  expiresAt: string;
};

const isPositive = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export function calculateQuote(input: QuoteInput): QuoteResult {
  const rate = RATE_TABLE[input.stablecoin] ?? RATE_TABLE.cUSD;
  let localAmount = input.localAmount;
  let stableAmount = input.stableAmount;

  if (isPositive(localAmount)) {
    stableAmount = Number((localAmount * rate).toFixed(2));
    localAmount = Number(localAmount.toFixed(2));
  } else if (isPositive(stableAmount)) {
    localAmount = Number((stableAmount / rate).toFixed(2));
    stableAmount = Number(stableAmount.toFixed(2));
  } else {
    throw new Error('Amount must be greater than zero.');
  }

  const fees = Number(Math.max(0.01, localAmount * 0.005).toFixed(2));
  return {
    localAmount,
    localCurrency: input.localCurrency || 'RWF',
    stableAmount,
    stablecoin: input.stablecoin,
    rate,
    fees,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
  };
}

export type StablecoinCode = 'cUSD' | 'USDC';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export type Merchant = {
  id: string;
  name: string;
  logoUrl?: string;
  msisdn?: string;
  country?: string;
};

export type Quote = {
  stablecoin: StablecoinCode;
  localAmount: number;
  localCurrency: string;
  stableAmount: number;
  rate: number;
  fees: number;
  expiresAt?: string;
};

export type PaymentDraft = {
  merchantId: string;
  reference: string;
  localAmount: number;
  localCurrency: string;
  stableAmount: number;
  stablecoin: StablecoinCode;
  msisdn: string;
  rate: number;
  fees: number;
};

export type PaymentReview = PaymentDraft & {
  quote: Quote;
  merchant: Merchant;
};

export type TxReceipt = {
  txId: string;
  merchantName: string;
  reference: string;
  localAmount: number;
  localCurrency: string;
  stableAmount: number;
  stablecoin: StablecoinCode;
  msisdn: string;
  fees: number;
  rate: number;
  status: PaymentStatus;
  createdAt: string;
};

export type PaymentRecord = TxReceipt & { id: string };

export type WalletBalances = Record<StablecoinCode, number>;

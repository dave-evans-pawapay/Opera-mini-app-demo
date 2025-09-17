export type Merchant = { id: string; name: string; logoUrl?: string; msisdn?: string; };
export type Quote = { stablecoin: 'cUSD' | 'USDC'; localAmount: number; stableAmount: number; rate: number; fees: number; };
export type PaymentDraft = {
  merchantId: string;
  reference: string;
  localAmount?: number;
  stableAmount?: number;
  stablecoin: 'cUSD' | 'USDC';
  msisdn: string;
};
export type TxReceipt = {
  txId: string;
  merchantName: string;
  reference: string;
  localAmount?: number;
  stableAmount: number;
  stablecoin: 'cUSD' | 'USDC';
  msisdn: string;
  fees: number;
};
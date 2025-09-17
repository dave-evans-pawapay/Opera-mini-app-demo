import { z } from 'zod';
export const PaymentDraftSchema = z.object({
  merchantId: z.string().min(1),
  reference: z.string().min(1),
  localAmount: z.number().optional(),
  stableAmount: z.number().positive().optional(),
  stablecoin: z.enum(['cUSD','USDC']),
  msisdn: z.string().min(7) // E.164 validation can be added here or via lib
});
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

const MsisdnSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MSISDN is required.' });
      return z.NEVER;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (!parsed || !parsed.isValid()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid MSISDN.' });
      return z.NEVER;
    }
    return parsed.number;
  });

export const PaymentDraftSchema = z.object({
  merchantId: z.string().min(1),
  reference: z.string().min(1),
  localAmount: z.number().positive(),
  localCurrency: z.string().min(1),
  stableAmount: z.number().positive(),
  stablecoin: z.enum(['cUSD', 'USDC']),
  msisdn: MsisdnSchema,
  rate: z.number().positive(),
  fees: z.number().min(0),
});

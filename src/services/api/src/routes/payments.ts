import { Router } from 'express';
import { PaymentDraftSchema } from '../util/validate';
import { db } from '../db/client';

const r = Router();

// Quote endpoint (stub logic)
r.get('/payments/quote', async (req, res) => {
  const localAmount = Number(req.query.localAmount ?? 0);
  const localCurrency = String(req.query.localCurrency ?? 'RWF');
  const stable = String(req.query.stable ?? 'cUSD');
  if (!localAmount || localAmount <= 0) return res.status(400).send('Invalid amount');
  const rate = 0.0008; // stub: 1 RWF => 0.0008 cUSD (example only)
  const fees = Math.max(0.01, localAmount * 0.005);
  const stableAmount = Number((localAmount * rate).toFixed(2));
  res.json({ localAmount, localCurrency, stablecoin: stable, stableAmount, rate, fees });
});

// Create payment (stub: record + pretend chain send)
r.post('/payments', async (req, res) => {
  const parsed = PaymentDraftSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).send(parsed.error.message);
  const p = parsed.data;

  // TODO: call MiniPay SDK from client to actually send; backend logs and reconciles
  const fakeTxId = `0x${Math.random().toString(16).slice(2)}`;
  const { rows } = await db.query(
    `insert into payments(merchant_id, reference, msisdn, stablecoin, local_amount, stable_amount, status, tx_id, rate, fees)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning id`,
    [p.merchantId, p.reference, p.msisdn, p.stablecoin, p.localAmount ?? null, p.stableAmount ?? 0, 'success', fakeTxId, 0.0008, 0.01]
  );

  res.json({
    txId: fakeTxId,
    merchantName: 'Demo Merchant',
    reference: p.reference,
    localAmount: p.localAmount,
    stableAmount: p.stableAmount ?? 0,
    stablecoin: p.stablecoin,
    msisdn: p.msisdn,
    fees: 0.01
  });
});

export default r;
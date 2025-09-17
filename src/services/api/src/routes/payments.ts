import { randomUUID } from 'crypto';
import { Router } from 'express';
import { db } from '../db/client';
import { calculateQuote } from '../util/quote';
import { PaymentDraftSchema } from '../util/validate';

const r = Router();

r.get('/payments/quote', (req, res) => {
  const localAmount = req.query.localAmount ? Number(req.query.localAmount) : undefined;
  const stableAmount = req.query.stableAmount ? Number(req.query.stableAmount) : undefined;
  const localCurrency = typeof req.query.localCurrency === 'string' && req.query.localCurrency
    ? String(req.query.localCurrency)
    : 'RWF';
  const stablecoin = req.query.stable === 'USDC' ? 'USDC' : 'cUSD';

  try {
    const quote = calculateQuote({ localAmount, stableAmount, localCurrency, stablecoin });
    res.json(quote);
  } catch (err) {
    res.status(400).send(err instanceof Error ? err.message : 'Unable to generate quote.');
  }
});

r.get('/payments', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10) || 10, 1), 100);
  try {
    const { rows } = await db.query(
      `select p.id, p.reference, p.msisdn, p.stablecoin, p.local_amount, p.local_currency, p.stable_amount,
              p.status, p.tx_id, p.rate, p.fees, p.created_at, m.name as merchant_name
         from payments p
         join merchants m on m.id = p.merchant_id
        order by p.created_at desc
        limit $1`,
      [limit]
    );
    const results = rows.map((row) => ({
      id: row.id,
      reference: row.reference,
      msisdn: row.msisdn,
      stablecoin: row.stablecoin,
      localAmount: Number(row.local_amount ?? 0),
      localCurrency: row.local_currency ?? 'RWF',
      stableAmount: Number(row.stable_amount ?? 0),
      status: row.status ?? 'success',
      txId: row.tx_id ?? '',
      rate: Number(row.rate ?? 0),
      fees: Number(row.fees ?? 0),
      merchantName: row.merchant_name ?? 'Unknown merchant',
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at ?? Date.now()).toISOString(),
    }));
    res.json(results);
  } catch (err) {
    console.error('Failed to list payments', err);
    res.status(500).send('Unable to load payments.');
  }
});

r.post('/payments', async (req, res) => {
  const parsed = PaymentDraftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).send(parsed.error.message);
  }
  const payload = parsed.data;

  try {
    const merchant = await db.query('select id, name from merchants where id = $1 limit 1', [payload.merchantId]);
    if (merchant.rowCount === 0) {
      return res.status(404).send('Merchant not found');
    }

    const quote = calculateQuote({
      localAmount: payload.localAmount,
      stableAmount: payload.stableAmount,
      localCurrency: payload.localCurrency,
      stablecoin: payload.stablecoin,
    });

    const amountDelta = Math.abs(quote.stableAmount - payload.stableAmount);
    const feeDelta = Math.abs(quote.fees - payload.fees);
    if (amountDelta > 0.05 || feeDelta > 0.05) {
      return res.status(409).send('Quote expired. Please refresh and try again.');
    }

    const txId = `0x${randomUUID().replace(/-/g, '').slice(0, 32)}`;

    const insert = await db.query(
      `insert into payments (merchant_id, reference, msisdn, stablecoin, local_amount, local_currency,
                             stable_amount, status, tx_id, rate, fees)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       returning status, created_at`,
      [
        payload.merchantId,
        payload.reference,
        payload.msisdn,
        payload.stablecoin,
        quote.localAmount,
        quote.localCurrency,
        quote.stableAmount,
        'success',
        txId,
        quote.rate,
        quote.fees,
      ]
    );

    const createdAt = insert.rows[0]?.created_at;
    const status = insert.rows[0]?.status ?? 'success';

    res.json({
      txId,
      merchantName: merchant.rows[0].name,
      reference: payload.reference,
      localAmount: quote.localAmount,
      localCurrency: quote.localCurrency,
      stableAmount: quote.stableAmount,
      stablecoin: payload.stablecoin,
      msisdn: payload.msisdn,
      fees: quote.fees,
      rate: quote.rate,
      status,
      createdAt: createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt ?? Date.now()).toISOString(),
    });
  } catch (err) {
    console.error('Failed to create payment', err);
    res.status(500).send('Unable to process payment.');
  }
});

export default r;

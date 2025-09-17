import { Router } from 'express';
import { db } from '../db/client';
const r = Router();

// demo list (replace with DB query)
r.get('/merchants', async (_req, res) => {
  const { rows } = await db.query('select id, name, logo_url as "logoUrl", msisdn from merchants order by name asc limit 100');
  res.json(rows);
});

export default r;
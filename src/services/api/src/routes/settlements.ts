import { Router } from 'express';
const r = Router();

// callbacks from PawaPay would hit endpoints here
r.post('/settlements/callback', (req, res) => {
  // TODO: verify signature, update payment status, store reason codes
  res.json({ ok: true });
});

export default r;
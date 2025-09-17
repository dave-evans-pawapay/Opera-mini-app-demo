import { Router } from 'express';
import { db } from '../db/client';

const r = Router();

const FALLBACK_MERCHANTS = [
  {
    id: 'merchant-001',
    name: 'Kigali Fresh Market',
    logoUrl: 'https://dummyimage.com/64x64/ff4b4b/ffffff&text=KF',
    country: 'Rwanda',
    msisdn: '+250780000001',
  },
  {
    id: 'merchant-002',
    name: 'Lagos Electronics',
    logoUrl: 'https://dummyimage.com/64x64/4b6cff/ffffff&text=LE',
    country: 'Nigeria',
    msisdn: '+2348012345678',
  },
  {
    id: 'merchant-003',
    name: 'Nairobi Boda Services',
    logoUrl: 'https://dummyimage.com/64x64/00b894/ffffff&text=NB',
    country: 'Kenya',
    msisdn: '+254701112233',
  },
];

r.get('/merchants', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'select id, name, logo_url as "logoUrl", msisdn, country from merchants order by name asc limit 100'
    );
    if (!rows.length) {
      return res.json(FALLBACK_MERCHANTS);
    }
    res.json(rows);
  } catch (err) {
    console.error('Failed to load merchants', err);
    res.json(FALLBACK_MERCHANTS);
  }
});

export default r;

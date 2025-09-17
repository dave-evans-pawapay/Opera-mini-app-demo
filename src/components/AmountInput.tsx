import { useEffect, useState } from 'react';
import { quoteLocalToStable } from '../lib/rates';

export default function AmountInput({ localCurrency, onQuote }:{ localCurrency: string; onQuote: (q:any)=>void; }) {
  const [amt, setAmt] = useState<number>(0);
  const [stable, setStable] = useState<'cUSD'|'USDC'>('cUSD');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string| null>(null);

  useEffect(()=>{ if(amt>0){ setLoading(true);
    quoteLocalToStable(amt, localCurrency, stable).then(q=>{ onQuote(q); setErr(null); })
      .catch(e=>setErr(String(e))).finally(()=>setLoading(false));
  }},[amt, stable, localCurrency]);

  return (
    <div>
      <label>Amount ({localCurrency})</label>
      <input type="number" min="0" step="0.01" value={amt} onChange={e=>setAmt(Number(e.target.value))} />
      <label>Stablecoin</label>
      <select value={stable} onChange={e=>setStable(e.target.value as any)}>
        <option value="cUSD">cUSD</option>
        <option value="USDC">USDC</option>
      </select>
      {loading && <p>Quoting…</p>}
      {err && <p style={{color:'crimson'}}>{err}</p>}
    </div>
  );
}
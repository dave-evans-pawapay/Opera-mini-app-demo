import { useEffect, useState } from 'react';
import { listMerchants } from '../lib/api';
import type { Merchant } from '../types';

export default function MerchantSelect({ onSelect }:{ onSelect:(m:Merchant)=>void }) {
  const [items, setItems] = useState<Merchant[]>([]);
  const [q, setQ] = useState('');
  useEffect(()=>{ listMerchants().then(setItems).catch(console.error); },[]);
  const filtered = items.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h2>Select Merchant</h2>
      <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
      <ul>
        {filtered.map(m=>(
          <li key={m.id}>
            <button onClick={()=>onSelect(m)}>
              {m.logoUrl && <img src={m.logoUrl} width={20}/>} {m.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
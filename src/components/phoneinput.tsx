import { useState } from 'react';
import { normalizeMsisdn } from '../lib/msisdn';

export default function PhoneInput({ onValid, defaultCountry = 'RW' }: { onValid: (e164: string)=>void; defaultCountry?: string; }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const onBlur = () => {
    try {
      const e164 = normalizeMsisdn(val, defaultCountry);
      setErr(null);
      onValid(e164);
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  return (
    <div>
      <label>Mobile number (MSISDN)</label>
      <input value={val} onChange={e=>setVal(e.target.value)} onBlur={onBlur} placeholder="+2507xxxxxxx" />
      {err && <p style={{color:'crimson'}}>{err}</p>}
    </div>
  );
}
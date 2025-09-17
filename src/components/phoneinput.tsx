import { useEffect, useState } from 'react';
import { normalizeMsisdn } from '../lib/msisdn';

type Props = {
  onValid: (e164: string) => void;
  onInvalid?: (message: string) => void;
  defaultCountry?: string;
  initialValue?: string;
  label?: string;
};

export default function PhoneInput({
  onValid,
  onInvalid,
  defaultCountry = 'RW',
  initialValue = '',
  label = 'Mobile number (MSISDN)',
}: Props) {
  const [val, setVal] = useState(initialValue);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValue) return;
    try {
      const normalized = normalizeMsisdn(initialValue, defaultCountry);
      setVal(initialValue);
      setErr(null);
      onValid(normalized);
    } catch (e) {
      setErr((e as Error).message);
      onInvalid?.((e as Error).message);
    }
    // We only want to run this when the initial value changes intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const validate = () => {
    if (!val.trim()) {
      const message = 'MSISDN is required.';
      setErr(message);
      onInvalid?.(message);
      return;
    }
    try {
      const e164 = normalizeMsisdn(val, defaultCountry);
      setErr(null);
      onValid(e164);
    } catch (e) {
      const message = (e as Error).message;
      setErr(message);
      onInvalid?.(message);
    }
  };

  return (
    <div>
      <label style={{ display: 'grid', gap: 4 }}>
        <span>{label}</span>
        <input
          value={val}
          onChange={(event) => {
            setVal(event.target.value);
            if (!event.target.value) {
              setErr(null);
              onInvalid?.('');
            }
          }}
          onBlur={validate}
          placeholder="e.g. +2507xxxxxxx"
          inputMode="tel"
        />
      </label>
      {err && <p style={{ color: 'crimson', margin: 0 }}>{err}</p>}
    </div>
  );
}

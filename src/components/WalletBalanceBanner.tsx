import type { StablecoinCode, WalletBalances } from '../types';

type Props = {
  balances: WalletBalances;
  stablecoin: StablecoinCode;
  required?: number | null;
};

export default function WalletBalanceBanner({ balances, stablecoin, required }: Props) {
  const available = balances[stablecoin] ?? 0;
  const needs = typeof required === 'number' ? required : null;
  const shortfall = needs !== null ? Number((needs - available).toFixed(2)) : null;
  const insufficient = shortfall !== null && shortfall > 0.0001;

  return (
    <div
      style={{
        background: insufficient ? '#fff2f0' : '#f3f8ff',
        border: `1px solid ${insufficient ? '#ff4b4b' : '#9bb5ff'}`,
        borderRadius: 12,
        padding: 12,
        display: 'grid',
        gap: 4,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 14 }}>Wallet balance</span>
      <span style={{ fontSize: 22, fontWeight: 700 }}>
        {available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
        {stablecoin}
      </span>
      {needs !== null && (
        <span style={{ fontSize: 13, color: insufficient ? '#b71c1c' : '#1b5e20' }}>
          {insufficient
            ? `Add at least ${Math.abs(shortfall ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${stablecoin} to continue.`
            : 'Sufficient balance to complete this payment.'}
        </span>
      )}
    </div>
  );
}

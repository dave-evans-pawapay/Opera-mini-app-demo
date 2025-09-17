import { useCallback, useState } from 'react';
import type { StablecoinCode, WalletBalances } from '../types';

const DEMO_BALANCES: WalletBalances = {
  cUSD: 125.4,
  USDC: 60.75,
};

export function useWallet(initialBalances: WalletBalances = DEMO_BALANCES) {
  const [balances, setBalances] = useState<WalletBalances>(initialBalances);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Placeholder for MiniPay SDK integration.
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustBalance = useCallback((coin: StablecoinCode, delta: number) => {
    setBalances((prev) => {
      const next = { ...prev };
      const current = next[coin] ?? 0;
      next[coin] = Number(Math.max(0, current + delta).toFixed(2));
      return next;
    });
  }, []);

  const getBalance = useCallback(
    (coin: StablecoinCode) => balances[coin] ?? 0,
    [balances]
  );

  return {
    balances,
    loading,
    refresh,
    adjustBalance,
    getBalance,
  };
}

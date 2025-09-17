import { useMemo, useState } from 'react';
import type { TxReceipt } from '../types';

type Props = {
  receipt: TxReceipt;
  onDone: () => void;
};

const formatStable = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Receipt({ receipt, onDone }: Props) {
  const [copied, setCopied] = useState(false);
  const localFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: receipt.localCurrency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }, [receipt.localCurrency]);

  const sharePayload = useMemo(() => {
    const lines = [
      `MiniPay payment receipt`,
      `Merchant: ${receipt.merchantName}`,
      `Reference: ${receipt.reference}`,
      `Amount: ${localFormatter.format(receipt.localAmount)} (${formatStable(receipt.stableAmount)} ${receipt.stablecoin})`,
      `Fees: ${localFormatter.format(receipt.fees)}`,
      `MSISDN: ${receipt.msisdn}`,
      `Status: ${receipt.status}`,
      `Tx: ${receipt.txId}`,
    ];
    return {
      title: 'MiniPay payment receipt',
      text: lines.join('\n'),
    };
  }, [receipt, localFormatter]);

  const downloadHref = useMemo(() => {
    const json = JSON.stringify(receipt, null, 2);
    return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  }, [receipt]);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }
    try {
      await navigator.clipboard.writeText(sharePayload.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch (err) {
        console.warn('Share cancelled', err);
      }
    }
    await handleCopy();
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Payment successful</h2>
        <p style={{ margin: 0, color: '#444' }}>Your receipt is ready. You can copy, download or share it.</p>
      </header>

      <section style={{ border: '1px solid #e0e0e0', borderRadius: 16, padding: 20, display: 'grid', gap: 12, background: '#fdfdfd' }}>
        <div>
          <span style={{ fontSize: 12, color: '#777' }}>Merchant</span>
          <p style={{ margin: 4, fontWeight: 700 }}>{receipt.merchantName}</p>
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#777' }}>Reference</span>
          <p style={{ margin: 4 }}>{receipt.reference}</p>
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#777' }}>Amount</span>
          <p style={{ margin: 4, fontWeight: 700 }}>
            {localFormatter.format(receipt.localAmount)} · {formatStable(receipt.stableAmount)} {receipt.stablecoin}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>Fees</span>
          <strong>{localFormatter.format(receipt.fees)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>MSISDN</span>
          <strong>{receipt.msisdn}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span>Status</span>
          <strong style={{ color: '#1b5e20' }}>{receipt.status.toUpperCase()}</strong>
        </div>
        <div style={{ fontSize: 12, color: '#777', wordBreak: 'break-all' }}>
          <span>Tx ID: {receipt.txId}</span>
        </div>
        <div style={{ fontSize: 12, color: '#777' }}>
          <span>Created: {new Date(receipt.createdAt).toLocaleString()}</span>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => void handleShare()} style={{ flex: 1 }}>
          Share receipt
        </button>
        <button type="button" onClick={() => void handleCopy()} style={{ flex: 1 }}>
          {copied ? 'Copied!' : 'Copy details'}
        </button>
        <a
          href={downloadHref}
          download={`receipt-${receipt.txId}.json`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #ccc',
            textDecoration: 'none',
            color: '#333',
            background: '#fff',
          }}
        >
          Download JSON
        </a>
      </div>

      <button
        type="button"
        onClick={onDone}
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          background: '#ff4b4b',
          color: '#fff',
          fontWeight: 700,
        }}
      >
        Start another payment
      </button>
    </div>
  );
}

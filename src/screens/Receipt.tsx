import type { TxReceipt } from '../types';
export default function Receipt({ receipt, onDone }:{ receipt: TxReceipt; onDone:()=>void }) {
  return (
    <div>
      <h2>Payment Receipt</h2>
      <pre>{JSON.stringify(receipt, null, 2)}</pre>
      <button onClick={onDone}>Done</button>
    </div>
  );
}
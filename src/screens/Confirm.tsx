export default function Confirm({ draft, onConfirm, onBack }:{ draft:any; onConfirm:()=>void; onBack:()=>void }) {
  const { quote } = draft;
  return (
    <div>
      <h2>Confirm Payment</h2>
      <ul>
        <li>Reference: {draft.reference}</li>
        <li>MSISDN: {draft.msisdn}</li>
        <li>Amount: {quote.localAmount} (local) ≈ {quote.stableAmount} {quote.stablecoin}</li>
        <li>Rate: {quote.rate} | Fees: {quote.fees}</li>
      </ul>
      <button onClick={onBack}>Back</button>
      <button onClick={onConfirm}>Pay</button>
    </div>
  );
}
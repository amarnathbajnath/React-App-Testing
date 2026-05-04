function SummaryBar({
  totals,
  markup, vat,
  setMarkup, setVat,
  labour, setLabour,
  inspection, setInspection
}) {

  return (
    <div className="summary-bar-2">

      <div>
        Materials: {formatCurrency(totals.subtotal)}
      </div>

      <div>
        Markup %:
        <input value={markup} onChange={e => setMarkup(toNumber(e.target.value))} />
      </div>

      <div>
        VAT %:
        <input value={vat} onChange={e => setVat(toNumber(e.target.value))} />
      </div>

      <div>
        Labour:
        <input value={labour} onChange={e => setLabour(toNumber(e.target.value))} />
      </div>

      <div>
        Inspection:
        <input value={inspection} onChange={e => setInspection(toNumber(e.target.value))} />
      </div>

      <div className="sum-value total">
        Total: {formatCurrency(totals.total)}
      </div>

    </div>
  );
}
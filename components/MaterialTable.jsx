function MaterialTable({ job, index, updateJob }) {

  const updateQty = (i, val) => {
    const items = [...job.tmpItems];
    items[i].Qty = toNumber(val);

    updateJob(index, { ...job, tmpItems: items });
  };

  return (
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {job.tmpItems.map((item, i) => (
          <tr key={i}>
            <td>{item.Item}</td>

            <td>
              <input
                type="number"
                value={item.Qty}
                onChange={e => updateQty(i, e.target.value)}
              />
            </td>

            <td>{formatCurrency(item.Price)}</td>
            <td>{formatCurrency(item.Qty * item.Price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
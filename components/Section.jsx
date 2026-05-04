function Section({ job, index, updateJob }) {

  const updateScope = e => {
    updateJob(index, { ...job, scope: e.target.value });
  };

  const addItem = () => {
    const newItem = {
      SKU: 'TMP',
      Item: 'New Item',
      Unit: 'each',
      Qty: 1,
      Price: 0
    };

    updateJob(index, {
      ...job,
      tmpItems: [...job.tmpItems, newItem]
    });
  };

  return (
    <div className="panel">
      <h2>Section {index + 1}</h2>

      <textarea
        className="field-input"
        value={job.scope}
        onChange={updateScope}
        placeholder="Scope..."
      />

      <MaterialTable job={job} index={index} updateJob={updateJob} />

      <button className="btn-outline" onClick={addItem}>
        + Add Item
      </button>
    </div>
  );
}
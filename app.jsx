const { useState, useEffect } = React;

/* HELPERS */
const toNumber = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
const formatCurrency = v => '$' + v.toFixed(2);

/* APP */
function App() {
  const [jobs, setJobs] = useState([
    { scope: '', addedItems: [], tmpItems: [] }
  ]);

  const [markup, setMarkup] = useState(27.5);
  const [vat, setVat] = useState(12.5);
  const [labour, setLabour] = useState(0);
  const [inspection, setInspection] = useState(0);

  /* CALCULATIONS */
  const calcTotals = () => {
    let subtotal = 0;

    jobs.forEach(job => {
      [...job.addedItems, ...job.tmpItems].forEach(item => {
        if (item.Price != null) {
          subtotal += item.Qty * item.Price;
        }
      });
    });

    const m = subtotal * (markup / 100);
    const v = (subtotal + m) * (vat / 100);
    const total = subtotal + m + v + labour + inspection;

    return { subtotal, m, v, total };
  };

  const totals = calcTotals();

  /* ADD SECTION */
  const addSection = () => {
    setJobs([...jobs, { scope: '', addedItems: [], tmpItems: [] }]);
  };

  /* UPDATE JOB */
  const updateJob = (index, updatedJob) => {
    const newJobs = [...jobs];
    newJobs[index] = updatedJob;
    setJobs(newJobs);
  };

  return (
    <div className="app-container">
      <h1 className="title-white">⚡ Job Costing Dashboard</h1>

      {jobs.map((job, i) => (
        <Section
          key={i}
          index={i}
          job={job}
          updateJob={updateJob}
        />
      ))}

      <button className="btn-primary" onClick={addSection}>
        + Add Section
      </button>

      <SummaryBar totals={totals} markup={markup} vat={vat}
        setMarkup={setMarkup} setVat={setVat}
        labour={labour} setLabour={setLabour}
        inspection={inspection} setInspection={setInspection}
      />
    </div>
  );
}

/* RENDER */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
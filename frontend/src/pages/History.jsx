// =====================================================================
// pages/History.jsx  -  every stock IN and OUT, with filters and CSV export
// =====================================================================
import { useState, useEffect } from "react";
import { api } from "../api.js";
import { downloadCsv } from "../csv.js";

function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // The filter boxes
  const [from, setFrom] = useState("");  // start date
  const [to, setTo] = useState("");      // end date
  const [type, setType] = useState("");  // "", "IN" or "OUT"

  // Ask the server for the history. Filters are added to the address, like:
  //   /stock/history?from=2026-11-01&to=2026-11-15&type=OUT
  // The three values are passed in, so "Reset" can load with empty filters.
  async function loadHistory(fromValue, toValue, typeValue) {
    setError("");
    try {
      const params = new URLSearchParams();
      if (fromValue) params.append("from", fromValue);
      if (toValue) params.append("to", toValue);
      if (typeValue) params.append("type", typeValue);
      setHistory(await api("/stock/history?" + params.toString()));
    } catch (err) {
      setError(err.message);
    }
  }

  // Load everything one time when the page opens
  useEffect(() => {
    loadHistory("", "", "");
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    loadHistory(from, to, type);
  }

  function handleReset() {
    setFrom("");
    setTo("");
    setType("");
    loadHistory("", "", "");
  }

  // Download the rows that are currently shown
  function exportCsv() {
    const rows = [["Date and time", "Product", "SKU", "Type", "Quantity", "Done by"]];
    history.forEach((t) => {
      rows.push([
        new Date(t.createdAt).toLocaleString(),
        t.product?.name || "(deleted product)",
        t.product?.sku || "-",
        t.type,
        t.quantity,
        t.doneBy?.username || "-",
      ]);
    });
    downloadCsv("stock-history.csv", rows);
  }

  return (
    <div>
      <h2>Stock movement history</h2>
      {error && <p className="error">{error}</p>}

      <form className="filter-bar" onSubmit={handleFilter}>
        <label className="inline">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="inline">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">IN and OUT</option>
          <option value="IN">Only IN</option>
          <option value="OUT">Only OUT</option>
        </select>
        <button className="btn" type="submit">Filter</button>
        <button className="btn-light dark" type="button" onClick={handleReset}>Reset</button>
        <button className="btn-light dark" type="button" onClick={exportCsv}>Export CSV</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date and time</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Done by</th>
            </tr>
          </thead>
          <tbody>
            {history.map((t) => (
              <tr key={t._id}>
                {/* createdAt is saved by MongoDB. toLocaleString() makes it readable. */}
                <td>{new Date(t.createdAt).toLocaleString()}</td>

                {/* The "?." means: if t.product is missing (product was deleted),
                    do not crash, just use the text after || */}
                <td>{t.product?.name || "(deleted product)"}</td>

                <td className={t.type === "IN" ? "type-in" : "type-out"}>{t.type}</td>
                <td>{t.quantity}</td>
                <td>{t.doneBy?.username || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && <p className="muted">No stock movements found.</p>}
    </div>
  );
}

export default History;

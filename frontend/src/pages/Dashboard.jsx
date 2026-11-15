// =====================================================================
// pages/Dashboard.jsx  -  summary numbers, two charts and the LOW STOCK list
// =====================================================================
import { useState, useEffect } from "react";
import { api } from "../api.js";
import { uniqueTypes } from "../constants.js";
import BarChart from "../components/BarChart.jsx";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [racks, setRacks] = useState([]);
  const [error, setError] = useState("");

  // Runs one time when the page opens (because of the [] at the end)
  useEffect(() => {
    // Promise.all = ask the server for three things at the same time,
    // then continue when all three answers have arrived.
    Promise.all([api("/products"), api("/stock/history"), api("/racks")])
      .then(([productList, historyList, rackList]) => {
        setProducts(productList);
        setHistory(historyList);
        setRacks(rackList);
      })
      .catch((err) => setError(err.message));
  }, []);

  // ----- Summary numbers -----
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0); // add all quantities
  const lowStock = products.filter((p) => p.quantity <= p.minLevel);   // keep only low stock
  const racksTaken = racks.filter((r) => r.occupied).length;           // pressure plate pressed

  // ----- Chart 1: units in stock for each type of goods -----
  // The types are not a fixed list: we use every different type found in the products.
  const stockByCategory = uniqueTypes(products.map((p) => p.category)).map((category) => ({
    label: category,
    a: products
      .filter((p) => p.category === category)
      .reduce((sum, p) => sum + p.quantity, 0),
  }));

  // ----- Chart 2: stock IN and OUT on each of the last 7 days -----
  // (it uses the latest 200 history records that the server sends)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i); // go back i days (6 days ago ... today)

    // Keep only the records that happened on this day
    const sameDay = history.filter(
      (t) => new Date(t.createdAt).toDateString() === day.toDateString()
    );

    last7Days.push({
      label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      a: sameDay.filter((t) => t.type === "IN").reduce((sum, t) => sum + t.quantity, 0),
      b: sameDay.filter((t) => t.type === "OUT").reduce((sum, t) => sum + t.quantity, 0),
    });
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="stat">
          <strong>{products.length}</strong>
          <span>Products</span>
        </div>
        <div className="stat">
          <strong>{totalUnits}</strong>
          <span>Units in stock</span>
        </div>
        <div className="stat warn">
          <strong>{lowStock.length}</strong>
          <span>Low stock items</span>
        </div>
        <div className="stat">
          <strong>{racksTaken} / {racks.length}</strong>
          <span>Racks taken</span>
        </div>
      </div>

      <div className="charts">
        <BarChart title="Units in stock by type" items={stockByCategory} />
        <BarChart title="Last 7 days" items={last7Days} aName="Stock IN" bName="Stock OUT" />
      </div>

      <h3>Low stock</h3>
      {lowStock.length === 0 ? (
        <p className="muted">All products have enough stock.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Rack</th>
                <th>In stock</th>
                <th>Minimum</th>
              </tr>
            </thead>
            <tbody>
              {/* map() turns each product into one table row */}
              {lowStock.map((p) => (
                <tr key={p._id} className="low">
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.rackLocation}</td>
                  <td>{p.quantity}</td>
                  <td>{p.minLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

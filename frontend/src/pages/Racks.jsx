// =====================================================================
// pages/Racks.jsx  -  the rack map with PRESSURE PLATE status
//
// Every rack has a pressure plate:
//   plate pressed  -> the rack is TAKEN (goods are on it)
//   plate released -> the rack is FREE
// Every rack also has a priority:
//   HIGH = fast-moving goods, near the dispatch door
//   LOW  = slow-moving goods, further away
//
// With real hardware, a sensor board calls POST /api/racks/sensor.
// Without hardware, the "Simulate plate" button below does the same job.
// =====================================================================
import { useState, useEffect } from "react";
import { api } from "../api.js";
import { STARTER_TYPES, uniqueTypes } from "../constants.js";

const emptyForm = { code: "", category: "Other", priority: "LOW" };

function Racks({ user }) {
  const [racks, setRacks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);

  const isAdmin = user.role === "admin";

  async function loadRacks() {
    try {
      setRacks(await api("/racks"));
    } catch (err) {
      setError(err.message);
    }
  }

  // Load the racks when the page opens, then again every 5 seconds,
  // so a change made by a real sensor board shows up by itself.
  useEffect(() => {
    loadRacks();
    const timer = setInterval(loadRacks, 5000); // 5000 milliseconds = 5 seconds
    return () => clearInterval(timer);          // stop the timer when we leave the page
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Admin: add a new rack
  async function addRack(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/racks", "POST", form);
      setForm(emptyForm);
      loadRacks();
    } catch (err) {
      setError(err.message);
    }
  }

  // Press or release the pressure plate (simulation)
  async function togglePlate(rack) {
    try {
      await api("/racks/" + rack._id + "/occupied", "PUT", { occupied: !rack.occupied });
      loadRacks();
    } catch (err) {
      setError(err.message);
    }
  }

  // Admin: change HIGH / LOW priority
  async function changePriority(rack, priority) {
    try {
      await api("/racks/" + rack._id, "PUT", { priority });
      loadRacks();
    } catch (err) {
      setError(err.message);
    }
  }

  // Admin: delete a rack
  async function removeRack(rack) {
    if (!window.confirm("Delete rack " + rack.code + "?")) return;
    try {
      await api("/racks/" + rack._id, "DELETE");
      loadRacks();
    } catch (err) {
      setError(err.message);
    }
  }

  // Suggestions for the "add rack" form, and the types for the filter box
  const typeSuggestions = uniqueTypes(STARTER_TYPES, racks.map((r) => r.category));
  const rackTypes = uniqueTypes(racks.map((r) => r.category));

  // Apply the two filters
  const visibleRacks = racks.filter(
    (r) =>
      (filterCategory === "All" || r.category === filterCategory) &&
      (!freeOnly || !r.occupied)
  );
  const taken = racks.filter((r) => r.occupied).length;

  return (
    <div>
      <h2>Racks</h2>
      {error && <p className="error">{error}</p>}

      <p className="muted">
        {taken} of {racks.length} racks are taken. <b>High priority</b> racks are near the
        dispatch door (fast-moving goods). <b>Low priority</b> racks are further away.
      </p>

      {/* Admin only: add a rack */}
      {isAdmin && (
        <form className="product-form" onSubmit={addRack}>
          <h3>Add a rack</h3>
          <div className="form-grid">
            <input name="code" placeholder="Rack code (for example E-01)" value={form.code} onChange={handleChange} required />
            {/* Type of goods this rack is for: type ANYTHING, or pick a suggestion */}
            <input
              name="category"
              list="rack-type-list"
              placeholder="Type of goods (e.g. Toys)"
              maxLength="30"
              value={form.category}
              onChange={handleChange}
              required
            />
            <datalist id="rack-type-list">
              {typeSuggestions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="HIGH">High priority</option>
              <option value="LOW">Low priority</option>
            </select>
          </div>
          <button className="btn" type="submit">Add rack</button>
        </form>
      )}

      <div className="filter-bar">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All types</option>
          {rackTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="inline">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          Free racks only
        </label>
      </div>

      <div className="rack-grid">
        {visibleRacks.map((r) => (
          // "taken" or "free" decides the coloured edge of the box
          <div key={r._id} className={"rack " + (r.occupied ? "taken" : "free")}>
            <div className="rack-top">
              <strong>{r.code}</strong>
              {/* The round light: red = plate pressed, green = plate free */}
              <span className={"plate " + (r.occupied ? "on" : "off")} title="Pressure plate"></span>
            </div>

            <p className="rack-state">{r.occupied ? "TAKEN (plate pressed)" : "FREE"}</p>

            <p>
              <span className="badge">{r.category}</span>
              <span className={"badge " + (r.priority === "HIGH" ? "high" : "lowp")}>
                {r.priority === "HIGH" ? "High priority" : "Low priority"}
              </span>
            </p>

            <p className="muted small">
              {r.products.length > 0
                ? r.products.map((p) => p.name + " (" + p.quantity + ")").join(", ")
                : "No product assigned"}
            </p>
            <p className="muted small">
              Plate updated: {r.lastSensorUpdate ? new Date(r.lastSensorUpdate).toLocaleString() : "never"}
            </p>

            <div className="rack-actions">
              <button className="btn-small" onClick={() => togglePlate(r)}>
                Simulate plate: {r.occupied ? "release" : "press"}
              </button>

              {isAdmin && (
                <>
                  <select value={r.priority} onChange={(e) => changePriority(r, e.target.value)}>
                    <option value="HIGH">High priority</option>
                    <option value="LOW">Low priority</option>
                  </select>
                  <button className="btn-small danger" onClick={() => removeRack(r)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {visibleRacks.length === 0 && <p className="muted">No racks to show.</p>}
    </div>
  );
}

export default Racks;

// =====================================================================
// pages/Products.jsx  -  list, search, filter, export, and (admin) add / edit / delete
// Only the ADMIN sees the form and the Edit / Delete buttons.
// =====================================================================
import { useState, useEffect } from "react";
import Barcode from "react-barcode"; // draws a barcode picture from a number
import { api } from "../api.js";
import { STARTER_TYPES, uniqueTypes } from "../constants.js";
import { downloadCsv } from "../csv.js";

// The form when it is empty. We reuse this object to reset the form.
const emptyForm = { name: "", sku: "", category: "Other", rackLocation: "-", price: "", minLevel: "" };

function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [form, setForm] = useState(emptyForm);      // what is typed in the form
  const [editingId, setEditingId] = useState(null); // null = adding, otherwise = editing that product
  const [error, setError] = useState("");

  // For searching and filtering the table
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const isAdmin = user.role === "admin";

  // Ask the server for the products AND the racks, and save them in state
  async function loadData() {
    try {
      const [productList, rackList] = await Promise.all([api("/products"), api("/racks")]);
      setProducts(productList);
      setRacks(rackList);
    } catch (err) {
      setError(err.message);
    }
  }

  // Load the data one time when the page opens
  useEffect(() => {
    loadData();
  }, []);

  // ----- Search and filter: keep only the products that match -----
  const text = search.trim().toLowerCase();
  const visibleProducts = products.filter((p) => {
    const matchesText =
      p.name.toLowerCase().includes(text) ||
      p.sku.toLowerCase().includes(text) ||
      p.barcode.includes(text);
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesText && matchesCategory;
  });

  // ----- Types of goods -----
  // Suggestions for the form: the starter types + every type already used
  const typeSuggestions = uniqueTypes(STARTER_TYPES, products.map((p) => p.category), racks.map((r) => r.category));
  // For the filter box: only the types that really exist in the products
  const productTypes = uniqueTypes(products.map((p) => p.category));

  // ----- Which racks can be chosen in the form? -----
  // Only racks made for the SAME type of goods, and only free ones
  // (pressure plate not pressed). When editing, the product's own rack stays allowed.
  const editingProduct = products.find((p) => p._id === editingId);
  const rackChoices = racks.filter(
    (r) =>
      r.category.toLowerCase() === form.category.trim().toLowerCase() &&
      (!r.occupied || (editingProduct && editingProduct.rackLocation === r.code))
  );

  // Find the rack object for a rack code (to show its priority in the table)
  function rackOf(code) {
    return racks.find((r) => r.code === code);
  }

  // Runs every time the user types in any form box.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value }); // copy the form, change one field
  }

  // Runs when the form is submitted (Save button)
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // If the type was changed and the chosen rack no longer fits it,
    // the rack is not in the dropdown any more, so we send "no rack" instead.
    const rackStillFits = form.rackLocation === "-" || rackChoices.some((r) => r.code === form.rackLocation);

    // Prepare the data to send. If a box was left empty, use a sensible default.
    const data = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      rackLocation: rackStillFits ? form.rackLocation : "-",
      price: Number(form.price) || 0,
      minLevel: form.minLevel === "" ? 10 : Number(form.minLevel),
    };

    try {
      if (editingId) {
        await api("/products/" + editingId, "PUT", data); // editing an existing product
      } else {
        await api("/products", "POST", data);             // adding a new product
      }
      setForm(emptyForm); // clear the form
      setEditingId(null);
      loadData();         // reload so the change appears
    } catch (err) {
      setError(err.message);
    }
  }

  // Runs when Edit is clicked: put that product's values into the form
  function startEdit(p) {
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      rackLocation: p.rackLocation,
      price: p.price,
      minLevel: p.minLevel,
    });
    setEditingId(p._id);
    window.scrollTo(0, 0); // go to the top where the form is
  }

  // Runs when Delete is clicked
  async function handleDelete(p) {
    // confirm() shows an "OK / Cancel" box
    if (!window.confirm("Delete " + p.name + "?")) return;
    try {
      await api("/products/" + p._id, "DELETE");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Download the products that are currently shown as an Excel-readable file
  function exportCsv() {
    const rows = [["Name", "SKU", "Type", "Rack", "Price", "In stock", "Minimum", "Barcode"]];
    visibleProducts.forEach((p) => {
      // The tab before the barcode stops Excel from turning the number into 1.7E+12
      rows.push([p.name, p.sku, p.category, p.rackLocation, p.price, p.quantity, p.minLevel, "\t" + p.barcode]);
    });
    downloadCsv("products.csv", rows);
  }

  return (
    <div>
      <h2>Products</h2>
      {error && <p className="error">{error}</p>}

      {/* The form is shown only if the user is admin */}
      {isAdmin && (
        <form className="product-form no-print" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit product" : "Add new product"}</h3>
          <div className="form-grid">
            <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
            <input name="sku" placeholder="SKU (unique code)" value={form.sku} onChange={handleChange} required />

            {/* Type of goods: type ANYTHING, or pick a suggestion from the list */}
            <input
              name="category"
              list="type-list"
              placeholder="Type of goods (e.g. Food)"
              maxLength="30"
              value={form.category}
              onChange={handleChange}
              required
            />
            <datalist id="type-list">
              {typeSuggestions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>

            {/* Dropdown: only free racks that match the type */}
            <select name="rackLocation" value={form.rackLocation} onChange={handleChange}>
              <option value="-">No rack yet</option>
              {rackChoices.map((r) => (
                <option key={r._id} value={r.code}>
                  {r.code} ({r.priority === "HIGH" ? "high" : "low"} priority)
                </option>
              ))}
            </select>

            <input name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={handleChange} />
            <input name="minLevel" type="number" min="0" placeholder="Minimum stock level" value={form.minLevel} onChange={handleChange} />
          </div>
          <button className="btn" type="submit">{editingId ? "Save changes" : "Add product"}</button>
          {editingId && (
            <button
              type="button"
              className="btn-light dark"
              onClick={() => { setEditingId(null); setForm(emptyForm); }}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {/* Search box, type filter and export button */}
      <div className="filter-bar no-print">
        <input
          placeholder="Search by name, SKU or barcode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All types</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="btn-light dark" onClick={exportCsv}>Export CSV</button>
        {/* window.print() opens the browser print window (use it to print barcodes) */}
        <button className="btn-light dark" onClick={() => window.print()}>Print</button>
      </div>

      <h3>Showing {visibleProducts.length} of {products.length} products</h3>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Type</th>
              <th>Rack</th>
              <th>Price</th>
              <th>In stock</th>
              <th>Barcode</th>
              {isAdmin && <th className="no-print">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((p) => {
              const rack = rackOf(p.rackLocation);
              return (
                // Rows with low stock get the "low" style (coloured background)
                <tr key={p._id} className={p.quantity <= p.minLevel ? "low" : ""}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td><span className="badge">{p.category}</span></td>
                  <td>
                    {p.rackLocation}
                    {/* Show the rack's priority if the product has a rack */}
                    {rack && (
                      <span className={"badge " + (rack.priority === "HIGH" ? "high" : "lowp")}>
                        {rack.priority === "HIGH" ? "High" : "Low"}
                      </span>
                    )}
                  </td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    {/* The barcode picture. "value" is the number stored in the barcode. */}
                    <Barcode value={p.barcode} height={40} width={1.3} fontSize={12} />
                  </td>
                  {isAdmin && (
                    <td className="no-print">
                      <button className="btn-small" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn-small danger" onClick={() => handleDelete(p)}>Delete</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visibleProducts.length === 0 && <p className="muted">No products match your search.</p>}
    </div>
  );
}

export default Products;

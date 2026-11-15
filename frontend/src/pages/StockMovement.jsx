// =====================================================================
// pages/StockMovement.jsx  -  the Stock IN and Stock OUT screen
// One component is used for both pages. The "type" prop is "IN" or "OUT".
//
// HOW SCANNING WORKS: a USB barcode scanner acts like a keyboard.
// When you scan, it types the barcode number into the box and presses Enter.
// Pressing Enter in a form submits it, so scanning "just works".
// No scanner? Type the number by hand.
// =====================================================================
import { useState, useRef } from "react";
import { api } from "../api.js";

function StockMovement({ type }) {
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null); // the success answer from the server
  const [error, setError] = useState("");

  // useRef gives us direct access to an HTML element (here, the barcode box)
  // so we can put the cursor back in it after every scan.
  const barcodeBox = useRef(null);

  const isIn = type === "IN";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      // Stock In calls /stock/in, Stock Out calls /stock/out
      const url = isIn ? "/stock/in" : "/stock/out";
      const data = await api(url, "POST", { barcode, quantity: Number(quantity) });
      setResult(data); // show the success message
    } catch (err) {
      setError(err.message); // show the error (for example "Not enough stock")
    }

    // Whether it worked or not, get ready for the NEXT scan
    setBarcode("");
    setQuantity(1);
    barcodeBox.current.focus();
  }

  return (
    <div>
      <h2>{isIn ? "Stock In (receiving goods)" : "Stock Out (dispatching goods)"}</h2>

      <form className={"scan-form " + (isIn ? "in" : "out")} onSubmit={handleSubmit}>
        <label>Barcode (scan or type)</label>
        <input
          ref={barcodeBox}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Click here, then scan"
          autoFocus
          required
        />

        <label>Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <button className="btn" type="submit">{isIn ? "Add to stock" : "Remove from stock"}</button>
      </form>

      {/* Success message (shown only when "result" is not empty) */}
      {result && (
        <div className="notice ok">
          <p>{result.message}</p>
          <p>
            {result.product.name} ({result.product.category}) now has{" "}
            <strong>{result.product.quantity}</strong> units (rack {result.product.rackLocation}).
          </p>
        </div>
      )}

      {/* Low-stock warning: shown when this move left the product at or below its minimum */}
      {result && result.product.quantity <= result.product.minLevel && (
        <div className="notice warn">
          Low stock! Only {result.product.quantity} left (minimum is {result.product.minLevel}).
          {result.product.quantity === 0 && " The product is now out of stock."}
        </div>
      )}

      {/* Error message */}
      {error && <div className="notice bad">{error}</div>}
    </div>
  );
}

export default StockMovement;

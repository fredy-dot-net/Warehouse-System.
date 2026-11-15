// =====================================================================
// routes/stockRoutes.js  -  STOCK IN, STOCK OUT and HISTORY
// This is the MOST IMPORTANT file of the project. Read it slowly.
// Every route here starts with /api/stock (set in server.js)
// =====================================================================
const express = require("express");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------
// moveStock: ONE function that handles BOTH stock in and stock out.
// "type" is either "IN" or "OUT".
// ---------------------------------------------------------------------
async function moveStock(type, req, res) {
  try {
    // 1. Read the barcode and quantity sent by React
    const barcode = String(req.body.barcode || "").trim();
    const quantity = Number(req.body.quantity);

    // 2. Check the input is valid
    if (!barcode) {
      return res.status(400).json({ message: "Scan or type a barcode" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a whole number above 0" });
    }

    // 3. Find the product that owns this barcode
    const product = await Product.findOne({ barcode });
    if (!product) {
      return res.status(404).json({ message: "No product found with this barcode" });
    }

    // 4. STOCK OUT rule: we cannot remove more than we have.
    //    This is how we stop the stock from going below zero.
    if (type === "OUT" && product.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock. Only " + product.quantity + " left." });
    }

    // 5. Change the quantity: add for IN, subtract for OUT
    if (type === "IN") {
      product.quantity = product.quantity + quantity;
    } else {
      product.quantity = product.quantity - quantity;
    }
    await product.save(); // save the new quantity in the database

    // 6. Write a history record (who, what, how many, in or out)
    await Transaction.create({
      product: product._id,
      type: type,
      quantity: quantity,
      doneBy: req.user._id, // req.user was set by the "protect" guard
    });

    // 7. Tell React it worked and send the updated product back
    res.json({
      message: "Stock " + type + " done: " + quantity + " x " + product.name,
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ---------- STOCK IN ----------
// POST /api/stock/in    body: { barcode, quantity }
router.post("/in", protect, (req, res) => moveStock("IN", req, res));

// ---------- STOCK OUT ----------
// POST /api/stock/out   body: { barcode, quantity }
router.post("/out", protect, (req, res) => moveStock("OUT", req, res));

// ---------- HISTORY ----------
// GET /api/stock/history  -> the latest 200 movements, newest first
// Optional filters in the address, for example:
//   /api/stock/history?from=2026-11-01&to=2026-11-15&type=OUT
router.get("/history", protect, async (req, res) => {
  try {
    // Build the search conditions step by step
    const filter = {};

    if (req.query.type === "IN" || req.query.type === "OUT") {
      filter.type = req.query.type;
    }

    // Date range: from the start of the "from" day to the end of the "to" day
    const from = req.query.from ? new Date(req.query.from + "T00:00:00") : null;
    const to = req.query.to ? new Date(req.query.to + "T23:59:59.999") : null;
    if ((from && isNaN(from)) || (to && isNaN(to))) {
      return res.status(400).json({ message: "Invalid date" });
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from; // $gte = greater than or equal
      if (to) filter.createdAt.$lte = to;     // $lte = less than or equal
    }

    const history = await Transaction.find(filter)
      // populate = replace the stored ID with the real details of that product / user
      .populate("product", "name sku")
      .populate("doneBy", "username")
      .sort({ createdAt: -1 }) // -1 means newest first
      .limit(200);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

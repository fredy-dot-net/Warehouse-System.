// =====================================================================
// routes/productRoutes.js  -  add, view, edit and delete products (CRUD)
// CRUD = Create, Read, Update, Delete
// Every route here starts with /api/products (set in server.js)
// =====================================================================
const express = require("express");
const Product = require("../models/Product");
const Rack = require("../models/Rack");
const { cleanCategory } = require("../models/categories");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------
// checkRack: make sure the chosen rack exists and is meant for this type of goods.
// Returns an error message (text) if something is wrong, or null if all is fine.
// Example: you cannot put Food on a rack made for Furniture.
// ---------------------------------------------------------------------
async function checkRack(category, rackLocation) {
  if (!rackLocation || rackLocation === "-") return null; // "no rack yet" is allowed

  const rack = await Rack.findOne({ code: rackLocation.toUpperCase() });
  if (!rack) return "Rack " + rackLocation + " does not exist";
  if (rack.category !== category) {
    return "Rack " + rack.code + " is for " + rack.category + ", not " + category;
  }
  return null;
}

// ---------- READ: get ALL products ----------
// GET /api/products      (any logged-in user)
router.get("/", protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }); // sort A to Z by name
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- READ: find ONE product by its barcode ----------
// GET /api/products/barcode/1700000000000
router.get("/barcode/:code", protect, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.code });
    if (!product) {
      return res.status(404).json({ message: "No product found with this barcode" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- CREATE: add a new product ----------
// POST /api/products     (admin only: see "protect, adminOnly" below)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, sku, rackLocation, price, minLevel } = req.body;
    const category = cleanCategory(req.body.category); // tidy the typed type of goods

    // Check the rack matches the type of goods
    const rackProblem = await checkRack(category, rackLocation);
    if (rackProblem) return res.status(400).json({ message: rackProblem });

    // The barcode number is made from the current time in milliseconds.
    // Example: 1731500000123. It is different every time, so it is unique.
    const barcode = Date.now().toString();

    // A new product starts with 0 stock. Stock is added later using "Stock In",
    // so that the history stays correct.
    const product = await Product.create({
      name, sku, barcode, category, rackLocation, price, minLevel,
    });

    res.status(201).json(product);
  } catch (err) {
    // Error code 11000 means "duplicate value" (SKU or barcode already exists)
    if (err.code === 11000) {
      return res.status(400).json({ message: "This SKU already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// ---------- UPDATE: edit a product ----------
// PUT /api/products/:id  (admin only)
// We do NOT allow editing quantity here. Quantity changes only through Stock In / Out.
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, sku, rackLocation, price, minLevel } = req.body;
    const category = cleanCategory(req.body.category); // tidy the typed type of goods

    const rackProblem = await checkRack(category, rackLocation);
    if (rackProblem) return res.status(400).json({ message: rackProblem });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, sku, category, rackLocation, price, minLevel },
      { new: true, runValidators: true } // new: true -> give back the updated product
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This SKU already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// ---------- DELETE: remove a product ----------
// DELETE /api/products/:id  (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

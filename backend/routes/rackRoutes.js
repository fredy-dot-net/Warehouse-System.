// =====================================================================
// routes/rackRoutes.js  -  racks and their PRESSURE PLATE sensors
// Every route here starts with /api/racks (set in server.js)
// =====================================================================
const express = require("express");
const Rack = require("../models/Rack");
const Product = require("../models/Product");
const { cleanCategory } = require("../models/categories");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// ---------- READ: all racks, with the products stored on each ----------
// GET /api/racks
router.get("/", protect, async (req, res) => {
  try {
    const racks = await Rack.find().sort({ code: 1 });
    const products = await Product.find({}, "name rackLocation quantity");

    // For each rack, attach the products whose rackLocation is this rack's code
    const result = racks.map((rack) => ({
      ...rack.toObject(), // toObject() turns the database document into a normal object
      products: products.filter((p) => p.rackLocation === rack.code),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- CREATE: add a rack (admin) ----------
// POST /api/racks     body: { code, category, priority }
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { code, category, priority } = req.body;
    const rack = await Rack.create({ code, category: cleanCategory(category), priority });
    res.status(201).json(rack);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This rack code already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// ---------- UPDATE: change the priority of a rack (admin) ----------
// PUT /api/racks/:id  body: { priority }
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const rack = await Rack.findByIdAndUpdate(
      req.params.id,
      { priority: req.body.priority },
      { new: true, runValidators: true }
    );
    if (!rack) return res.status(404).json({ message: "Rack not found" });
    res.json(rack);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ---------- DELETE: remove a rack (admin) ----------
// DELETE /api/racks/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const rack = await Rack.findById(req.params.id);
    if (!rack) return res.status(404).json({ message: "Rack not found" });

    // Do not allow deleting a rack that still has products assigned to it
    const inUse = await Product.exists({ rackLocation: rack.code });
    if (inUse) {
      return res.status(400).json({ message: "Move the products out of this rack first" });
    }

    await rack.deleteOne();
    res.json({ message: "Rack deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- SIMULATE the pressure plate from the website ----------
// PUT /api/racks/:id/occupied   body: { occupied: true or false }
// Any logged-in user can press the "plate" button on the Racks page.
router.put("/:id/occupied", protect, async (req, res) => {
  try {
    const rack = await Rack.findByIdAndUpdate(
      req.params.id,
      { occupied: req.body.occupied === true, lastSensorUpdate: new Date() },
      { new: true }
    );
    if (!rack) return res.status(404).json({ message: "Rack not found" });
    res.json(rack);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- REAL HARDWARE: a sensor board (Arduino / ESP32) calls this ----------
// POST /api/racks/sensor
// Header:  x-sensor-key: <the SENSOR_KEY from your .env file>
// Body:    { "code": "A-01", "occupied": true }
// There is no user login here, because a sensor board cannot log in.
// Instead it must send the secret SENSOR_KEY, so strangers cannot fake readings.
router.post("/sensor", async (req, res) => {
  try {
    if (!process.env.SENSOR_KEY || req.headers["x-sensor-key"] !== process.env.SENSOR_KEY) {
      return res.status(401).json({ message: "Invalid sensor key" });
    }

    const code = String(req.body.code || "").toUpperCase();
    const rack = await Rack.findOneAndUpdate(
      { code },
      { occupied: req.body.occupied === true, lastSensorUpdate: new Date() },
      { new: true }
    );
    if (!rack) return res.status(404).json({ message: "No rack with this code" });

    res.json(rack);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

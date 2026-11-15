// =====================================================================
// seed.js  -  fills the database with starting data (run it ONE time)
// Run with:  npm run seed
// WARNING: it deletes the old users, products, racks and history first.
// =====================================================================
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");
const Rack = require("./models/Rack");
const Transaction = require("./models/Transaction");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1. Clear old data
  await User.deleteMany();
  await Product.deleteMany();
  await Rack.deleteMany();
  await Transaction.deleteMany();

  // 2. Create two users. bcrypt.hash scrambles the password (10 = how strong).
  const admin = await User.create({
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  });
  await User.create({
    username: "staff",
    password: await bcrypt.hash("staff123", 10),
    role: "staff",
  });

  // 3. Racks. "taken: true" means the pressure plate is pressed (goods are on it).
  //    HIGH priority racks are near the dispatch door, for fast-moving goods.
  const racks = [
    { code: "A-01", category: "Electronics", priority: "HIGH", taken: true },
    { code: "A-02", category: "Electronics", priority: "HIGH", taken: true },
    { code: "A-03", category: "Electronics", priority: "LOW", taken: false },
    { code: "B-01", category: "Furniture", priority: "LOW", taken: true },
    { code: "B-02", category: "Furniture", priority: "LOW", taken: true },
    { code: "B-03", category: "Furniture", priority: "HIGH", taken: false },
    { code: "C-01", category: "Food", priority: "HIGH", taken: true },
    { code: "C-02", category: "Food", priority: "HIGH", taken: false },
    { code: "C-03", category: "Food", priority: "LOW", taken: false },
    { code: "D-01", category: "Other", priority: "LOW", taken: true },
    { code: "D-02", category: "Other", priority: "LOW", taken: false },
  ];
  for (const r of racks) {
    await Rack.create({
      code: r.code,
      category: r.category,
      priority: r.priority,
      occupied: r.taken,
      lastSensorUpdate: new Date(),
    });
  }

  // 4. Sample products. Each one sits on a rack of the SAME type.
  //    "Packing Tape" has only 5 units (minimum 10), so it shows as LOW STOCK.
  const samples = [
    { name: "USB Cable", sku: "USB-001", category: "Electronics", rack: "A-01", price: 150, qty: 120, min: 20 },
    { name: "Wireless Mouse", sku: "MOU-002", category: "Electronics", rack: "A-02", price: 450, qty: 60, min: 15 },
    { name: "Office Chair", sku: "CHR-003", category: "Furniture", rack: "B-01", price: 4500, qty: 25, min: 5 },
    { name: "Study Table", sku: "TBL-004", category: "Furniture", rack: "B-02", price: 6200, qty: 12, min: 4 },
    { name: "Rice Bag 10kg", sku: "RIC-005", category: "Food", rack: "C-01", price: 650, qty: 80, min: 20 },
    { name: "Packing Tape", sku: "TAP-006", category: "Other", rack: "D-01", price: 40, qty: 5, min: 10 },
  ];

  let counter = 0;
  for (const s of samples) {
    const product = await Product.create({
      name: s.name,
      sku: s.sku,
      barcode: String(Date.now() + counter), // +counter keeps every barcode different
      category: s.category,
      rackLocation: s.rack,
      price: s.price,
      quantity: s.qty,
      minLevel: s.min,
    });
    counter++;

    // Also save a history record, so the history page is not empty
    await Transaction.create({
      product: product._id,
      type: "IN",
      quantity: s.qty,
      doneBy: admin._id,
    });
  }

  console.log("Done! Logins -> admin / admin123   and   staff / staff123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.log("Seed failed:", err.message);
  process.exit(1);
});

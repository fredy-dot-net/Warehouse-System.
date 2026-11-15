// =====================================================================
// models/Rack.js  -  one storage spot (rack) in the warehouse
//
// Each rack has a PRESSURE PLATE under it. When a pallet or box is placed
// on the rack, the plate is pressed and "occupied" becomes true.
// When the goods are taken away, "occupied" becomes false.
// =====================================================================
const mongoose = require("mongoose");
const { cleanCategory } = require("./categories");

const rackSchema = new mongoose.Schema({
  // Name of the rack, for example "A-01". unique = no two racks share a code.
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },

  // Which TYPE of goods may be kept here. It can be anything (Food, Toys, Auto Parts ...).
  category: { type: String, default: "Other", set: cleanCategory, maxlength: 30 },

  // HIGH = fast-moving goods, kept near the dispatch door (picked often)
  // LOW  = slow-moving goods, kept further away
  priority: { type: String, enum: ["HIGH", "LOW"], default: "LOW" },

  // true = the pressure plate is pressed (something is on the rack)
  occupied: { type: Boolean, default: false },

  // When the plate last changed
  lastSensorUpdate: { type: Date },
});

module.exports = mongoose.model("Rack", rackSchema);

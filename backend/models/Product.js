// =====================================================================
// models/Product.js  -  the SHAPE of one product in the database
// A "schema" is a blueprint: it lists the fields and their types.
// =====================================================================
const mongoose = require("mongoose");
const { cleanCategory } = require("./categories");

const productSchema = new mongoose.Schema({
  // required: true  -> the field cannot be left empty
  name: { type: String, required: true, trim: true }, // trim removes extra spaces

  // unique: true -> no two products can have the same SKU
  // (SKU = Stock Keeping Unit, a unique code for each product)
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },

  // The number that is printed as a barcode. The server creates it automatically.
  barcode: { type: String, required: true, unique: true },

  // Type of goods. It can be ANYTHING (Food, Furniture, Toys ...).
  // "set" runs cleanCategory every time a value is saved, to tidy the text.
  category: { type: String, default: "Other", set: cleanCategory, maxlength: 30 },

  // The code of the rack where it is kept, e.g. "A-01". "-" means no rack yet.
  rackLocation: { type: String, default: "-" },
  price: { type: Number, default: 0, min: 0 },

  // How many units we have right now. min: 0 means it can never go below zero.
  quantity: { type: Number, default: 0, min: 0 },

  // If quantity is equal to or lower than this, the product is "low stock"
  minLevel: { type: Number, default: 10, min: 0 },
});

// Make the model so other files can use it:  const Product = require("../models/Product")
module.exports = mongoose.model("Product", productSchema);

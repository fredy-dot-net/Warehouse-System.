// =====================================================================
// models/Transaction.js  -  one record for every stock IN or stock OUT
// This is the "history book" of the warehouse.
// =====================================================================
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // "ref" links this record to a document in another collection.
    // We store only the product's ID here, not all its details.
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    // enum means: only these exact values are allowed
    type: { type: String, enum: ["IN", "OUT"], required: true },

    quantity: { type: Number, required: true, min: 1 },

    // Which user did this movement
    doneBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  // timestamps: true -> MongoDB automatically adds "createdAt" (date and time)
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

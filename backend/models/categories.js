// =====================================================================
// models/categories.js  -  helper for the TYPE of goods
// A type can be ANYTHING the admin types (Food, Furniture, Auto Parts, Toys ...).
// This function only tidies the text, so "food", " Food " and "FOOD"
// do not end up as three different types.
// =====================================================================
function cleanCategory(text) {
  // 1. remove spaces at the start and end, and double spaces inside
  const cleaned = String(text || "").trim().replace(/\s+/g, " ");

  // 2. nothing typed? use "Other"
  if (!cleaned) return "Other";

  // 3. make the first letter of every word a capital: "auto parts" -> "Auto Parts"
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

module.exports = { cleanCategory };

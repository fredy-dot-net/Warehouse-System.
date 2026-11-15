// =====================================================================
// constants.js  -  values and small helpers used in many pages
// =====================================================================

// Suggestions shown when the admin types a type of goods.
// They are ONLY suggestions. The admin can type any other type.
export const STARTER_TYPES = ["Food", "Furniture", "Electronics", "Other"];

// Joins several lists of type names into ONE list without repeats.
// "Food" and "food" count as the same, and the result is sorted A to Z.
export function uniqueTypes(...lists) {
  const seen = new Map(); // key = lowercase name, value = the name to show
  lists.flat().forEach((type) => {
    if (type && !seen.has(type.toLowerCase())) {
      seen.set(type.toLowerCase(), type);
    }
  });
  return [...seen.values()].sort();
}

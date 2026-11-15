// =====================================================================
// csv.js  -  turns a table of data into a CSV file that opens in Excel
// CSV = Comma Separated Values (a plain text table)
//
// How to use:
//   downloadCsv("products.csv", [["Name", "Qty"], ["Pen", 10], ["Book", 5]]);
// The first row should be the column titles.
// =====================================================================
export function downloadCsv(filename, rows) {
  // Turn every cell into text inside quotes. A quote inside a cell is doubled ("").
  const lines = rows.map((row) =>
    row.map((cell) => '"' + String(cell ?? "").replace(/"/g, '""') + '"').join(",")
  );
  const text = "\uFEFF" + lines.join("\n"); // \uFEFF helps Excel read the letters correctly

  // Make a temporary file in the browser and "click" a hidden download link for it
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url); // clean up
}

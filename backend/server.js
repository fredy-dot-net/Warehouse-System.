// =====================================================================
// server.js  -  the STARTING POINT of the backend (the server)
// Start it with:  npm start
// =====================================================================

// STEP 1: Load the secret settings from the ".env" file
// (after this line we can use process.env.PORT, process.env.MONGO_URI, etc.)
require("dotenv").config();

// STEP 2: Bring in the tools (libraries) we need.
// "require" means "load this library so I can use it".
const express = require("express");   // builds the web server
const mongoose = require("mongoose"); // talks to the MongoDB database
const cors = require("cors");         // allows our React website to call this server

// STEP 3: Create the server application
const app = express();

// STEP 4: Middleware = helpers that run on EVERY request before our routes
app.use(cors());         // allow the React website (a different address) to call us
app.use(express.json()); // understand the JSON data that React sends us

// STEP 5: Connect each group of routes to a URL start.
// Example: a request to /api/products/... is handled by routes/productRoutes.js
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/racks", require("./routes/rackRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// STEP 6: A simple test page. Open http://localhost:5000 to check the server is alive.
app.get("/", (req, res) => {
  res.send("Warehouse API is running");
});

// STEP 7: Connect to MongoDB first. Only when it works, start the server.
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
  })
  .catch((err) => {
    console.log("Could not connect to MongoDB:", err.message);
  });

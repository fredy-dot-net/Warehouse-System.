// =====================================================================
// main.jsx  -  the first file React runs
// It puts our <App /> inside the <div id="root"> of index.html
// =====================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // lets us have many pages (URLs)
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

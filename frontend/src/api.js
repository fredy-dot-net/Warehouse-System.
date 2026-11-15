// =====================================================================
// api.js  -  ONE helper function that talks to the backend server.
// Every page uses it, so we do not repeat the same code again and again.
//
// How to use it in other files:
//   const products = await api("/products");                       // GET (read)
//   await api("/products", "POST", { name: "Pen", sku: "P-1" });  // POST (create)
// =====================================================================

// The address of our backend server
const API_URL = "http://localhost:5000/api";

export async function api(path, method = "GET", body = null) {
  // Get the login token we saved in the browser when the user logged in
  const token = localStorage.getItem("token");

  // Build the request settings
  const options = {
    method: method,
    headers: { "Content-Type": "application/json" }, // we are sending JSON data
  };

  // If we have a token, send it so the server knows who we are
  if (token) {
    options.headers.Authorization = "Bearer " + token;
  }

  // If we have data to send (for POST / PUT), attach it
  if (body) {
    options.body = JSON.stringify(body); // turn the JavaScript object into text
  }

  // Send the request. If the server is switched off, fetch fails here.
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch (err) {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json(); // read the answer

  // If the server answered with an error (400, 401, 403, 404, 500...),
  // throw an error so the page can show the message.
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

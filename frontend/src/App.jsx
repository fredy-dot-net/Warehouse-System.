// =====================================================================
// App.jsx  -  the MAIN component. It decides which page to show.
//
// Simple words you will see in React:
//  - component : a function that returns a piece of the screen (HTML-like code, called JSX)
//  - state     : a variable React watches. When it changes, the screen updates.
//                We create it with useState.
//  - props     : information we pass to a component, like <Navbar user={user} />
// =====================================================================
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import StockMovement from "./pages/StockMovement.jsx";
import History from "./pages/History.jsx";
import Racks from "./pages/Racks.jsx";
import Users from "./pages/Users.jsx";

function App() {
  // "user" holds the logged-in user, or null if nobody is logged in.
  // On first load we try to read it from the browser's saved data (localStorage),
  // so the user stays logged in even after refreshing the page.
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  // Called by the Login page after a successful login
  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user); // this change makes React redraw the screen
  }

  // Called when the Logout button is clicked
  function handleLogout() {
    localStorage.clear(); // remove token and user from the browser
    setUser(null);
  }

  // If nobody is logged in, show ONLY the login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // If someone is logged in, show the menu bar and the correct page
  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="page">
        <Routes>
          {/* path = the URL, element = the page to show */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products user={user} />} />

          {/* Stock In and Stock Out use the SAME page component.
              We pass type="IN" or type="OUT" to tell it which one it is.
              "key" makes React treat them as two separate pages. */}
          <Route path="/stock-in" element={<StockMovement key="IN" type="IN" />} />
          <Route path="/stock-out" element={<StockMovement key="OUT" type="OUT" />} />

          <Route path="/history" element={<History />} />
          <Route path="/racks" element={<Racks user={user} />} />

          {/* Only the admin may open the Users page. Staff are sent back to the dashboard. */}
          <Route
            path="/users"
            element={user.role === "admin" ? <Users user={user} /> : <Navigate to="/" />}
          />

          {/* Any other URL goes back to the dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

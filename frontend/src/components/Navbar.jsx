// =====================================================================
// components/Navbar.jsx  -  the menu bar shown at the top of every page
// =====================================================================
import { NavLink } from "react-router-dom";

// { user, onLogout } are PROPS: information given to us by App.jsx
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <span className="brand">Warehouse Tracker</span>

      {/* NavLink is like <a href>, but it does not reload the page.
          "end" on the first link stops "/" from looking active on every page. */}
      <div className="links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/stock-in">Stock In</NavLink>
        <NavLink to="/stock-out">Stock Out</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/racks">Racks</NavLink>

        {/* The Users page is only for the admin */}
        {user.role === "admin" && <NavLink to="/users">Users</NavLink>}
      </div>

      <div className="user-box">
        <span>{user.username} ({user.role})</span>
        <button className="btn-light" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;

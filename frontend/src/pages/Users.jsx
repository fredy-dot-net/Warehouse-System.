// =====================================================================
// pages/Users.jsx  -  the ADMIN adds and removes staff accounts
// (the menu link and the route are already hidden from staff)
// =====================================================================
import { useState, useEffect } from "react";
import { api } from "../api.js";

const emptyForm = { username: "", password: "", role: "staff" };

function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    try {
      setUsers(await api("/users"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function addUser(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("/users", "POST", form);
      setMessage("User " + form.username + " created");
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUser(u) {
    if (!window.confirm("Delete user " + u.username + "?")) return;
    setError("");
    setMessage("");
    try {
      await api("/users/" + u._id, "DELETE");
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Users</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="ok-text">{message}</p>}

      <form className="product-form" onSubmit={addUser}>
        <h3>Add a user</h3>
        <div className="form-grid">
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn" type="submit">Create user</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  {/* You cannot delete yourself, so the button is hidden for your own row */}
                  {u.username !== user.username && (
                    <button className="btn-small danger" onClick={() => removeUser(u)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;

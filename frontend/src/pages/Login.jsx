// =====================================================================
// pages/Login.jsx  -  the login screen
// =====================================================================
import { useState } from "react";
import { api } from "../api.js";

function Login({ onLogin }) {
  // One state variable for each thing that can change on this page
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Runs when the user clicks the Login button (submits the form)
  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");       // clear any old error message

    try {
      // Send username and password to the server and wait for the answer
      const data = await api("/auth/login", "POST", { username, password });
      onLogin(data); // tell App.jsx the login worked
    } catch (err) {
      setError(err.message); // show the error text on the screen
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>Warehouse Tracker</h1>
        <p className="muted">Log in to manage stock</p>

        {/* value + onChange = the input always shows our state variable
            and updates it whenever the user types */}
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {/* Show the error only when there is one */}
        {error && <p className="error">{error}</p>}

        <button className="btn" type="submit">Log in</button>
      </form>
    </div>
  );
}

export default Login;

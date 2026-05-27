import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const data = await api.login(form);
      localStorage.setItem("authToken", data.token);
      navigate("/puzzles");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <h2>Login</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Username or email
          <input
            value={form.identifier}
            onChange={(event) => setForm({ ...form, identifier: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

export default Login;

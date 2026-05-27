import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const data = await api.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
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
      <h2>Register</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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
        <label>
          Confirm password
          <input
            type="password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </section>
  );
}

export default Register;

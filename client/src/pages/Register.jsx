import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function getPasswordErrors(password, confirm) {
  const errors = [];
  if (password.length === 0) return errors;
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/\d/.test(password)) errors.push("At least one number");
  if (confirm.length > 0 && password !== confirm) errors.push("Passwords do not match");
  return errors;
}

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordErrors = getPasswordErrors(form.password, form.confirm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    const validationErrors = getPasswordErrors(form.password, form.confirm);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
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
      setServerError(err.message);
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
        {form.password.length > 0 && passwordErrors.length > 0 && (
          <ul className="password-requirements">
            {passwordErrors.map((msg) => (
              <li key={msg} className="password-requirement-error">{msg}</li>
            ))}
          </ul>
        )}
        {form.password.length > 0 && passwordErrors.length === 0 && (
          <p className="password-requirement-ok">Password looks good!</p>
        )}
        <label>
          Confirm password
          <input
            type="password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            required
          />
        </label>
        {serverError && <p className="error">{serverError}</p>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </section>
  );
}

export default Register;

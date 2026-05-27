import React, { useState } from "react";
import { api } from "../services/api";

function AccountSettings() {
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    try {
      await api.deleteAccount();
      localStorage.removeItem("authToken");
      setMessage("Account deleted.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page">
      <h2>Account Settings</h2>
      <div className="card">
        <p>Delete your account permanently. This cannot be undone.</p>
        {!confirming ? (
          <button className="danger-button" type="button" onClick={() => setConfirming(true)}>
            Delete account
          </button>
        ) : (
          <div className="button-row">
            <button className="danger-button" type="button" onClick={handleDelete}>
              Confirm delete
            </button>
            <button className="secondary-button" type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        )}
        {message && <p className="message">{message}</p>}
      </div>
    </section>
  );
}

export default AccountSettings;

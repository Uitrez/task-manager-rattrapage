import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(path) {
    setError("");
    const res = await fetch(`http://localhost:3001/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error || "Erreur");

    localStorage.setItem("token", data.token);
    onLogin(data.token);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Connexion</h2>
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <br />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <button onClick={() => submit("login")}>Login</button>
      <button onClick={() => submit("register")}>Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

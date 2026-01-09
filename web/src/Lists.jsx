import { useEffect, useState, useCallback } from "react";
import ListDetail from "./ListDetail";

export default function Lists({ token, onLogout }) {
  const [lists, setLists] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState("");
  const [isCoop, setIsCoop] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetch("http://localhost:3001/lists", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLists(data.lists || []);
  }, [token]);

  useEffect(() => {
  (async () => {
    const res = await fetch("http://localhost:3001/lists", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLists(data.lists || []);
  })();
}, [token]);

  async function createList() {
    await fetch("http://localhost:3001/lists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, isCoop })
    });

    setName("");
    setIsCoop(false);

    reload();
  }

  if (selectedId) {
    return <ListDetail token={token} listId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Mes listes</h2>
      <button onClick={onLogout}>Logout</button>

      <h3>Créer une liste</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
      <label style={{ marginLeft: 8 }}>
        <input
          type="checkbox"
          checked={isCoop}
          onChange={(e) => setIsCoop(e.target.checked)}
        />
        coop
      </label>
      <button onClick={createList} disabled={!name}>
        Créer
      </button>

      <h3>Listes</h3>
      <ul>
        {lists.map((l) => (
          <li key={l.id}>
            <button onClick={() => setSelectedId(l.id)}>
              #{l.id} {l.name} {l.isCoop ? "(coop)" : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

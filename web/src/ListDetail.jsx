import { useEffect, useState, useCallback } from "react";

export default function ListDetail({ token, listId, onBack }) {
  const [list, setList] = useState(null);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");

  const reload = useCallback(async () => {
    setMsg("");
    const res = await fetch(`http://localhost:3001/lists/${listId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setList(data.list);
  }, [token, listId]);

  useEffect(() => {
  (async () => {
    await reload();
  })();
}, [reload]);

  async function addTask() {
    setMsg("");
    const res = await fetch(`http://localhost:3001/lists/${listId}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || "Erreur");
      return;
    }

    setTitle("");
    reload();
  }

  async function toggle(task) {
    setMsg("");
    const res = await fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "If-Unmodified-Since": new Date(task.updatedAt).toUTCString()
      },
      body: JSON.stringify({ done: !task.done })
    });

    if (res.status === 428) setMsg("Précondition requise (428)");
    else if (res.status === 409) setMsg("Conflit (409) : recharge la liste");
    else if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || "Erreur");
    } else {
      reload();
    }
  }

  if (!list) return <div style={{ padding: 16 }}>Chargement...</div>;

  const myRole = list.isCoop ? (list.myRole || "reader") : "owner";
  const canWrite = myRole !== "reader";

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack}>← retour</button>
      <h2>{list.name}</h2>
      <p>Rôle : {myRole}</p>
      {msg && <p style={{ color: "red" }}>{msg}</p>}

      <h3>Tâches</h3>
      <ul>
        {list.tasks.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                disabled={!canWrite}
                onChange={() => toggle(t)}
              />
              {t.title}
            </label>
          </li>
        ))}
      </ul>

      {canWrite && (
        <>
          <h3>Ajouter une tâche</h3>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
          <button onClick={addTask} disabled={!title}>
            Ajouter
          </button>
        </>
      )}
    </div>
  );
}

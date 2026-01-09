import { useState } from "react";
import Login from "./Login";
import Lists from "./Lists";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <Lists
      token={token}
      onLogout={() => {
        localStorage.removeItem("token");
        setToken(null);
      }}
    />
  );
}


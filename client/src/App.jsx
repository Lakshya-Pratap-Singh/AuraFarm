import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

import "./styles/sidebar.css";
import "./styles/dashboard.css";

function App() {
  const [missions, setMissions] = useState(() => {
    const savedMissions = localStorage.getItem("missions");

    return savedMissions
      ? JSON.parse(savedMissions)
      : [
          {
            id: 1,
            title: "Morning Training",
            completed: false,
          },
          {
            id: 2,
            title: "Read 20 Pages",
            completed: true,
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem(
      "missions",
      JSON.stringify(missions)
    );
  }, [missions]);

  return (
    <div className="app">
      <Sidebar />

      <main className="app-main">
        <AppRoutes
          missions={missions}
          setMissions={setMissions}
        />
      </main>
    </div>
  );
}

export default App;
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="min-h-screen lg:ml-64">
        <Header
          title={activePage}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main>
          <Dashboard activePage={activePage} />
        </main>
      </div>
    </div>
  );
}
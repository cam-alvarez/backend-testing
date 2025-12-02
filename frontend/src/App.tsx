import { useState } from "react";
import OldProjectsList from "./OldApp"; // Your existing code
import NewProjectsList from "./components/projects/ProjectsList"; // New architecture

function App() {
  const [view, setView] = useState<"old" | "new">("new");

  return (
    <div>
      {/* Toggle between old and new */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">React Query Architecture Demo</a>
        </div>
        <div className="flex-none">
          <div className="btn-group">
            <button
              className={`btn ${view === "old" ? "btn-active" : ""}`}
              onClick={() => setView("old")}
            >
              Old Approach
            </button>
            <button
              className={`btn ${view === "new" ? "btn-active" : ""}`}
              onClick={() => setView("new")}
            >
              New Architecture
            </button>
          </div>
        </div>
      </div>

      {/* Show selected view */}
      {view === "old" ? <OldProjectsList /> : <NewProjectsList />}
    </div>
  );
}

export default App;

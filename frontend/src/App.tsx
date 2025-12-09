import OldProjectsList from "./OldApp"; // Your existing code
import { ChartBuilder } from "./components/charts/ChartBuilder";
import { DatasetDataTest } from "./components/charts/DatasetDataTest";
import NewProjectsList from "./components/projects/ProjectsList"; // New architecture

function App() {
  // const [view, setView] = useState<"old" | "new">("new");

  return (
    <div>
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">React Query Architecture Demo</a>
        </div>
      </div>
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-lg tabs-lift mt-5 mx-5">
        <input type="radio" name="my_tabs_6" className="tab" aria-label="Old" />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <OldProjectsList />
        </div>

        <input
          type="radio"
          name="my_tabs_6"
          className="tab"
          aria-label="New"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <NewProjectsList />
        </div>

        <input
          type="radio"
          name="my_tabs_6"
          className="tab"
          aria-label="Dataset Data Test"
        />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <DatasetDataTest />
        </div>
        <input
          type="radio"
          name="my_tabs_6"
          className="tab"
          aria-label="Charts"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-6">
          <ChartBuilder />
        </div>
      </div>

      {/* Toggle between old and new */}

      {/* <div className="flex-none">
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
        </div> */}

      {/* Show selected view
      {view === "old" ? <OldProjectsList /> : <NewProjectsList />} */}
    </div>
  );
}

export default App;

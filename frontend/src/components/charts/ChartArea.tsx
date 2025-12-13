import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DatasetSelector } from "./DatasetSelector";

export const ChartArea = () => {
  const [settingsIsOpen, setSettingsIsOpen] = useState(true);
  return (
    <>
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex">
            <div className="grow rounded-md">
              <div className="flex justify-between just px-2 py-1 ">
                <div className="self-start card-title">Chart Preview</div>
                <button
                  onClick={() =>
                    settingsIsOpen == true
                      ? setSettingsIsOpen(false)
                      : setSettingsIsOpen(true)
                  }
                  className="btn btn-ghost btn-sm p-0 m-0"
                >
                  <Cog6ToothIcon className="self-start size-5 stroke-2 text-neutral-500" />
                </button>
              </div>
            </div>
            {settingsIsOpen && (
              <div className="basis-1/4 shrink">
                <div className="flex items-center py-1 ">
                  <span className="font-semibold text-md text-neutral-500">
                    Chart Settings
                  </span>
                </div>

                <div className="border-2 border-base-300 rounded-md bg-white">
                  <div className="collapse collapse-arrow border-b border-base-300 rounded-none pt-1">
                    <input type="checkbox" />
                    <h2 className="collapse-title font-semibold text-md py-1">
                      Dataset
                    </h2>
                    <div className="collapse-content">
                      <DatasetSelector />
                    </div>
                  </div>

                  <div className="collapse collapse-arrow border-b border-base-300 rounded-none pt-1">
                    <input type="checkbox" />
                    <h2 className="collapse-title font-semibold text-md py-1">
                      Chart Axes
                    </h2>
                    <div className="collapse-content">
                      <DatasetSelector />
                    </div>
                  </div>
                  <div className="collapse collapse-arrow  rounded-none pt-1">
                    <input type="checkbox" />
                    <h2 className="collapse-title font-semibold text-md py-1">
                      Chart Options
                    </h2>
                    <div className="collapse-content">
                      <DatasetSelector />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

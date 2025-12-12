import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { DatasetSelector } from "./DatasetSelector";

export const ChartArea = () => {
  return (
    <>
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="flex items-center px-2 py-1 ">
                <Cog6ToothIcon className="size-5 stroke-2 mr-1 text-neutral-500" />
                <span className="font-semibold text-md text-neutral-500">
                  Chart Settings
                </span>
              </div>

              <div className="border-2 border-base-300 rounded-md bg-white">
                <div className="collapse collapse-arrow border-b border-base-300 rounded-none">
                  <input type="checkbox" />
                  <h2 className="collapse-title font-semibold text-md py-1">
                    Dataset
                  </h2>
                  <div className="collapse-content">
                    <DatasetSelector />
                  </div>
                </div>

                <div className="collapse collapse-arrow border-b border-base-300 rounded-none">
                  <input type="checkbox" />
                  <h2 className="collapse-title font-semibold text-md py-1">
                    Chart Axes
                  </h2>
                  <div className="collapse-content">
                    <DatasetSelector />
                  </div>
                </div>
                <div className="collapse collapse-arrow  rounded-none">
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

            <div className="col-span-3  rounded-md">
              <div className="card-title">Chart Preview</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

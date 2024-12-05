import React, { useEffect, useState, useContext } from "react";
import { AppDarkMode } from "../../App";
const Config = ({ socket }) => {
  const darkMode = useContext(AppDarkMode);

  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [useCaseValue, setUseCaseValue] = useState("Braude");
  const useCaseOptions = ["All", "Braude"];
  const defaultRefreshInterval = 1000;

  const getUseCase = (e) => {
    const newUseCaseValue = e.target.value;
    setUseCaseValue(newUseCaseValue);
    socket.emit("useCaseData", {
      useCaseValue: newUseCaseValue,
    });
  };

  const applyRefreshInterval = () => {
    socket.emit("refreshInterval", {
      refreshInterval: refreshInterval,
    });
  }
  
  const resetRefreshInterval = () => {
    setRefreshInterval(defaultRefreshInterval);
    socket.emit("refreshInterval", {
      refreshInterval: defaultRefreshInterval,
    });
  }

  // listen to the refreshInterval from the server
  useEffect(() => {
    socket.on("refreshInterval", (data) => {
      console.log("Received refresh interval from server:", data.refreshInterval);
      setRefreshInterval(data.refreshInterval);
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-top">
        <h1
          className={`text-lg text-${
            darkMode ? "[#ffffff]" : "[#304463]"
          } font-bold p-2`}
        >
          CONFIGURATION
        </h1>
      </div>
      <div
        className={`rounded w-[100%] p-4 ${
          darkMode ? "bg-[#50698f]" : "bg-white"
        } shadow-md`}
      >
        <div className="grid grid-rows-2 grid-flow-col gap-3">
          <div>
            <label>Device Use Case</label>
            <select
              value={useCaseValue}
              onChange={getUseCase}
              className="border p-1 ml-3 mr-2 rounded w-[100px] focus:outline-none text-black"
            >
              {useCaseOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Refresh Time</label>
            <input
              type="number"
              className="border p-1 ml-3 rounded w-[80px] focus:outline-none text-black"
              placeholder="1000"
              value={refreshInterval}
              onInput={(e) => setRefreshInterval(e.target.value)}
              step={refreshInterval <= 200 ? 50 : 100}
            />
            <label className="mr-3 text-sm text-gray-500"> ms </label>
            <button
              onClick={applyRefreshInterval}
              className={`rounded mr-2 text-sm px-4 py-2 ${
                darkMode
                  ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600"
                  : "text-gray-900 border border-gray-200 focus:outline-none hover:border-gray-300"
              }`}
            >
              Apply
            </button>
            <button
              onClick={resetRefreshInterval}
              className={`rounded text-sm px-4 py-2 ${
                darkMode
                  ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600"
                  : "text-gray-900 border border-gray-200 focus:outline-none hover:border-gray-300"
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;

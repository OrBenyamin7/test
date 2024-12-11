import React, { useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import Device from "./Device/Device.js";
import DeviceNode from "./Device/DeviceNode.js";
import { AppDarkMode } from "../../App";
import { parseAttributeKey, parseAttributeID } from "../../Utils/StringParser";

import ServerSpeedWidget from "../Widgets/ServerSpeedWidget.js";
import ActiveDevicesWidget from "../Widgets/ActiveDevicesWidget.js";
import PinnedAttributeWidget from "../Widgets/PinnedAttributeWidget.js";
import DeviceCompareScreen from "./DeviceCompare.js";
import Config from "./Config.js";

// Initialize the WebSocket connection (replace with your server URL)
const socket = io("https://test-3wa3.onrender.com");

const Body = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [transferSpeeds, setTransferSpeeds] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);

  const darkMode = useContext(AppDarkMode);

  useEffect(() => {
    // Listen for 'devices' events from the server
    socket.on("devices", (data) => {
      setDevices(data);
      // Automatically update the selected device data if it is still in the list
      if (selectedDevice) {
        const updatedDevice = data.find(
          (device) => device.id === selectedDevice.id
        );
        if (updatedDevice) {
          setSelectedDevice(updatedDevice);
        }
      }
    });

    // Listen for 'transferSpeed' events from the server
    socket.on("transferSpeed", (speed) => {
      setTransferSpeeds((prevSpeeds) => {
        const updatedSpeeds = [
          ...prevSpeeds,
          { time: new Date().toLocaleTimeString(), speed },
        ];
        return updatedSpeeds.length > 50
          ? updatedSpeeds.slice(-50)
          : updatedSpeeds; // Keep only the last 10 values
      });
    });

    // Cleanup on component unmount
    return () => {
      socket.off("devices");
      socket.off("transferSpeed");
    };
  }, [selectedDevice]);

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  const onExpandCompare = () => {
    setExpanded(true);
  };

  const onToggleExpandCompare = () => {
    if (expanded) {
      console.log("Collapsing");
      // Trigger slide-out animation first
      setAnimate(true);
      setTimeout(() => {
        setExpanded(false);
        setAnimate(false);
      }, 200);
    } else {
      console.log("Expanding");
      setExpanded(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <ActiveDevicesWidget devices={devices} />
        <ServerSpeedWidget transferSpeeds={transferSpeeds} />
        <PinnedAttributeWidget socket={socket} devices={devices} />
        <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 p-4 w-full md:w-[20%] flex items-center shadow rounded h-[70px]"></div>
        <div className="bg-gradient-to-r from-blue-100 to-sky-200 p-4 w-full md:w-[30%] flex items-center shadow rounded h-[70px]"></div>
      </div>

      <div className="flex flex-col md:flex-row h-[900px] gap-4 p-4">
        <div className="w-full md:w-[20%]">
          <div
            className={`p-4 h-full ${
              darkMode ? "bg-[#304463] rounded" : "bg-gray-100 rounded"
            }`}
          >
            <div className="flex justify-between mb-3 items-center">
              <h1
                className={`text-lg text-${
                  darkMode ? "[#ffffff]" : "[#304463]"
                } font-bold p-2`}
              >
                DEVICES
              </h1>
              <button
                onClick={onToggleExpandCompare}
                className={`flex items-center gap-2 align-right h-fit ${
                  darkMode
                    ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700"
                    : "text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"
                } rounded text-sm px-4 py-2`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  className="size-5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <line x1="4" y1="19" x2="20" y2="19" />{" "}
                  <polyline points="4 15 8 9 12 11 16 6 20 10" />
                </svg>
                <span>Compare</span>
              </button>
            </div>
            <div className="overflow-auto h-[550px]">
              <table className="table-fixed w-full">
                <thead className="">
                  <tr>
                    <th className="text-left w-[20px] p-1">#</th>
                    <th className="text-left w-[150px] p-1">ID</th>
                    <th className="text-left w-[150px] p-2">Type</th>
                    <th className="text-right p-1">Show</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, index) => {
                    const isSelected = device === selectedDevice;
                    return (
                      <tr
                        key={device.id}
                        className="cursor-pointer border-t border-dashed h-[50px] border-gray-200 rounded-lg"
                        style={{
                          backgroundColor: isSelected ? "rgba(0,0,0,0.03)" : "",
                          borderLeft: isSelected ? "2px solid #304463" : "",
                        }}
                        onClick={() => handleDeviceClick(device)}
                      >
                        <td className="p-1 font-light">{index + 1}</td>
                        <td className="p-1 font-light">
                          {parseAttributeID(device.id)}
                        </td>
                        <td className="p-2">
                          {parseAttributeKey(device.type)}
                        </td>
                        <td className="p-1 w-fit text-right">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 accent-[#304463]"
                            defaultChecked={true}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <hr className="w-[400px] h-1 mx-auto my-4 bg-gray-200 border-0 rounded md:my-5 dark:bg-gray-700"></hr>
            <Config socket={socket} />
          </div>
        </div>

        <div className="w-full md:w-[55%]">
          {expanded && (
            <div
              className={`absolute md:w-[50%] ${
                darkMode ? "bg-[#445672]" : "bg-gray-100"
              } bg-opacity-90 h-[868px] p-4 rounded-tl rounded-bl overflow-auto z-10`}
              style={{
                animation: animate
                  ? "slideOut 0.2s ease-out forwards"
                  : "slideIn 0.2s ease-out forwards",
              }}
            >
              <DeviceCompareScreen
                socket={socket}
                onToggleExpand={onToggleExpandCompare}
              />
            </div>
          )}
          <div
            className={`p-4 h-full relative ${
              darkMode ? "bg-[#304463] bg-mapDark" : "bg-white bg-map"
            } bg-contain bg-no-repeat bg-center border-4 rounded border border-gray-100`}
          >
            {devices &&
              devices.length > 0 &&
              devices.map((device, index) => {
                const positions = {
                  0: [30, 75],
                  1: [40, 75],
                  2: [50, 10],
                  3: [25, 80], // 4
                  4: [28, 72],
                  5: [22, 70],
                  6: [25, 75],
                  7: [35, 80],
                  8: [35, 70],
                  9: [60, 60],
                  10: [65, 60],
                };

                const position = positions[index] || [0, 0]; // Default position if undefined
                const isSelected = device === selectedDevice;
                return (
                  <DeviceNode
                    key={device.id}
                    device={device}
                    index={index}
                    onClick={handleDeviceClick}
                    style={{
                      left: `${position[0]}%`,
                      top: `${position[1]}%`,
                      borderWidth: isSelected ? "0px" : "4px",
                    }}
                  />
                );
              })}
          </div>
        </div>

        <div className="w-full md:w-[25%]">
          <div
            className={`z-10 p-4 h-full ${
              darkMode ? "bg-[#304463] rounded" : "bg-gray-100 rounded"
            }`}
          >
            <div className="flex justify-between mb-3 items-center">
              <h1
                className={`text-lg text-${
                  darkMode ? "[#ffffff]" : "[#304463]"
                } font-bold p-2`}
              >
                DEVICE ATTRIBUTES
              </h1>
              {selectedDevice && (
                <button
                  onClick={() => setSelectedDevice(null)}
                  className={`rounded text-sm px-4 py-2 ${
                    darkMode
                      ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700"
                      : "text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"
                  }`}
                >
                  Close
                </button>
              )}
            </div>
            {selectedDevice ? (
              <Device
                socket={socket}
                onExpandCompare={onExpandCompare}
                device={selectedDevice}
              />
            ) : (
              <div className="flex flex-wrap">
                <p className="">Select a device to view its attributes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;

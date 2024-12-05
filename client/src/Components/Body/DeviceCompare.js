import React, { useContext, useState, useEffect } from "react";
import { AppDarkMode } from "../../App";
import DynamicLineChart from "../Graphs/DynamicLineChart";
import { parseAttributeKey } from "../../Utils/StringParser";
import { ColorPicker } from "antd";
import * as XLSX from 'xlsx'

const DeviceCompareScreen = ({ socket, onToggleExpand }) => {
  const darkMode = useContext(AppDarkMode);

  // State for filtering options
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastXValues, setLastXValues] = useState("");
  const [selectedGraphColor, setSelectedGraphColor] = useState("#304463");

  const [deviceID, setDeviceID] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");

  // State to store the graphs
  const [graphs, setGraphs] = useState([]);

  // Loading state to handle spinner visibility
  const [loading, setLoading] = useState(false);

  const submitGraphFilter = async () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const lastX = parseInt(lastXValues);

    // Show the loading spinner
    setLoading(true);

    // Emit the filter data to the server via Socket.io
    socket.emit("graphFilterData", {
      deviceID,
      deviceType,
      attributeKey,
      startDateTime,
      endDateTime,
      lastX,
      color: selectedGraphColor,
    });
  };
  // Listen for the filtered data from the server
  useEffect(() => {
    socket.on("graphFilteredData", (data) => {
      // Create a new graph object with all necessary properties
      const newGraphData = data;
      console.log("Received filtered graph data:", newGraphData);

      // Stop the loading spinner
      setLoading(false);

      // Append the new graph data to the graphs array
      setGraphs((prevGraphs) => [newGraphData, ...prevGraphs]);
    });

    socket.on("selectedDeviceData", (data) => {
      // Handle received data here
      console.log("Selected Device Data:", data);
      setDeviceID(data.deviceID);
      setDeviceType(data.deviceType);
      setAttributeKey(data.attributeKey);
      setAttributeValue(data.attributeValue);
    });

    socket.on("error", (error) => {
      console.error("Error received from server:", error.message);
      setLoading(false); // Stop loading if there's an error
    });

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off("graphFilteredData");
      socket.off("error");
      socket.off("selectedDeviceData");
    };
  }, [socket, selectedGraphColor]);

  // Function to remove a specific graph from the list
  const removeGraph = (indexToRemove) => {
    setGraphs((prevGraphs) =>
      prevGraphs.filter((_, index) => index !== indexToRemove)
    );
  };

  // Function to move the graph up in the list view
  const moveGraphUp = (index) => {
    if (index === 0) return; // Can't move the first graph up
    const newGraphs = [...graphs];
    const [movedGraph] = newGraphs.splice(index, 1);
    newGraphs.splice(index - 1, 0, movedGraph);
    setGraphs(newGraphs);
  };

  // Function to move the graph down in the list view
  const moveGraphDown = (index) => {
    if (index === graphs.length - 1) return; // Can't move the last graph down
    const newGraphs = [...graphs];
    const [movedGraph] = newGraphs.splice(index, 1);
    newGraphs.splice(index + 1, 0, movedGraph);
    setGraphs(newGraphs);
  };

  // Function fo export the graph's data to Excel file
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new(); // Create a new workbook

  graphs.forEach((graphData, index) => {
    const { deviceID, attributeKey, values } = graphData;
    const data = [['Timestamp', 'Value']]; // Define headers for each graph sheet

    // Populate the data array with values
    values.forEach(({ timestamp, value }) => {
      data.push([new Date(timestamp).toLocaleString(), value]);
    });

    // Create a new row for the header with device ID and attribute name
    const headerRow = [
      [`Device ID: ${deviceID}`, `Attribute: ${parseAttributeKey(attributeKey)}`]
    ];

    // Create a worksheet for the current graph
    const ws = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.sheet_add_aoa(ws, headerRow, { origin: 'C1' });

    // Set the column widths for better visibility
    ws['!cols'] = [
      { wch: 20 }, // Width for Timestamp
      { wch: 15 }, // Width for Value
      { wch: 20 },  // Width for Device ID 
      { wch: 20 },  // Width for Attribute 
    ];
    
    // Append the worksheet to the workbook with a unique name
    XLSX.utils.book_append_sheet(wb, ws, `Graph ${index + 1}`);
  });

  // Get the current date and time
  const now = new Date();
  const formattedDate = now.toISOString().replace(/[:.]/g, '-').replace('T', ' ').slice(0, 19);; // Replace colons and dots

  // Create the filename with the formatted date and time
  const filename = `${formattedDate}.xlsx`;

  // Export the workbook
  XLSX.writeFile(wb, filename);
};

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-top">
          <div className={`flex items-center rounded ${darkMode ? "bg-[#50698f]" : "bg-white"} p-4 shadow-md`}>
            <span className="font-light mr-3">{deviceID}</span>
            <span className="color-[#304463] whitespace-nowrap font-bold">
              {parseAttributeKey(attributeKey)}
            </span>
          </div>

          <div className="grid grid-flow-col auto-cols-max gap-3">
            <button 
            onClick={exportToExcel}
            className={`flex items-center gap-2 align-right h-fit ${darkMode ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700" :"text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"} rounded text-sm px-4 py-2`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>

              <span>Export</span>
            </button>
            <button
              onClick={onToggleExpand}
              className={`flex items-center gap-2 align-right h-fit ${darkMode ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700" :"text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"} rounded text-sm px-4 py-2`}
              >
              Close
            </button>
          </div>
        </div>

        {/* Graph Filter Form - Date */}
        <div
          className={`h-fit rounded p-4 ${
            darkMode ? "bg-[#50698f]" : "bg-white"
          } shadow-md`}
        >
          <div className="grid grid-rows-2 grid-flow-col gap-3">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                className="border p-1 ml-3 rounded focus:outline-none text-black"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                className="border p-1 ml-3 rounded focus:outline-none text-black"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label>Start Time</label>
              <input
                type="time"
                className="border p-1 ml-3 rounded focus:outline-none text-black"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="time"
                className="border p-1 ml-3 rounded focus:outline-none text-black"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div>
              <label>Last X Values</label>
              <input
                type="number"
                className="border p-1 ml-3 rounded w-[100px] focus:outline-none text-black"
                placeholder="1000"
                value={lastXValues}
                onChange={(e) => setLastXValues(e.target.value)}
              />
            </div>
            <div>
              <ColorPicker
                defaultValue={selectedGraphColor}
                onChangeComplete={(color) => setSelectedGraphColor(color.toHexString())}
                showText
                disabledAlpha
              />
            </div>
            <button
              onClick={submitGraphFilter}
              className={`w-fit h-fit ${darkMode ? "bg-[#304463] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700" :"text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"} rounded text-sm px-4 py-2`}>
              Generate
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center items-center">
            <div className="m-4 w-10 h-10 border-4 border-gray-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        )}
        {/* Graph Display */}
        {graphs.map((graphData, index) => {
          return (
            <div
              key={index}
              className={`group h-fit rounded p-4 ${
                darkMode ? "bg-[#50698f]" : "bg-white"
              } shadow-md`}
            >
              <div className="flex flex-row-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Remove graph button */}
                <button
                  className="relative z-10"
                  onClick={() => removeGraph(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5 absolute right-[0px] top-[2px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Move up button */}
                <button
                  className={`relative z-10 ${index === 0 ? 'opacity-40' : ''}`}
                  onClick={() => moveGraphUp(index)}
                  disabled={index === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1"
                    stroke="currentColor"
                    className="size-6 absolute right-[40px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18V6m0 0l-4 4m4-4l4 4"
                    />
                  </svg>
                </button>

                {/* Move down button */}
                <button
                  className={`relative z-10 ${index === (graphs.length - 1) ? 'opacity-40' : ''}`}
                  onClick={() => moveGraphDown(index)}
                  disabled={index === (graphs.length - 1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1"
                    stroke="currentColor"
                    className="size-6 absolute right-[20px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                </button>
              </div>
              <DynamicLineChart
                graphID={index}
                lastX={graphData.lastX}
                attributeKey={graphData.attributeKey}
                deviceID={graphData.deviceID}
                created={graphData.created}
                values={graphData.values}
                color={graphData.color}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DeviceCompareScreen;

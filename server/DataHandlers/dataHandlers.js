const axios = require("axios");
let cachedData = null;
let totalDataSent = 0; // Track total data sent for speed calculation

// Function to fetch filtered graph data from the API based on filter parameters
const fetchFilteredGraphData = async (
    deviceID,
    deviceType,
    startDateTime,
    endDateTime,
    lastX
  ) => {
    try {
      // Construct the API URL dynamically based on the filter parameters
      const API_URL = `http://172.16.101.172:8668/v2/entities/urn:ngsi-ld:${deviceType}:${deviceID}?lastN=${lastX}&fromDate=${startDateTime.toISOString()}&toDate=${endDateTime.toISOString()}`;
      console.log("Fetching data from API:", API_URL);
  
      const response = await axios.get(
        `http://98.66.138.91:300/cors-anywhere/${API_URL}`,
        {
          headers: {
            Accept: "application/json",
            Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
            "X-Requested-With": "XMLHttpRequest", // Add this header
            "fiware-service": "openiot",
            "fiware-servicepath": "/",
          },
        }
      );
  
      // Return the fetched data
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered graph data:", error.message);
      throw new Error("Failed to fetch filtered graph data.");
    }
};


  // Function to fetch data from the API
const fetchDevices = async (io, currentUseCaseValue) => {
    try {
      // API URL (using the CORS proxy)
      const API_URL =
        "http://172.16.101.172:1026/ngsi-ld/v1/entities/?local=true";
      const response = await axios.get(
        `http://98.66.138.91:300/cors-anywhere/${API_URL}`,
        {
          headers: {
            Accept: "application/json",
            Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
            "X-Requested-With": "XMLHttpRequest", // Add this header
            "fiware-service": "openiot",
            "fiware-servicepath": "/",
          },
        }
      );
      // Filter devices based on the useCases attribute
      let filteredData = response.data;
      if (currentUseCaseValue !== "All") {
        // Filter devices based on the useCases attribute if it's not "All"
        filteredData = response.data.filter(device =>
          device.useCases && device.useCases.value === currentUseCaseValue
        );
      }
      cachedData = filteredData;
      const dataSize = JSON.stringify(cachedData).length; // Calculate the size of the data
      totalDataSent += dataSize; // Increment total data sent
  
      io.emit("devices", cachedData); // Broadcast the data to all connected clients
    } catch (error) {
      console.error("Error fetching data from external API:", error.message);
    }
};

// Function to calculate and emit transfer speed
const calculateAndEmitSpeed = (io) => {
    const transferSpeed = totalDataSent / 5; // Calculate speed (data per second)
    io.emit("transferSpeed", transferSpeed);
    totalDataSent = 0; // Reset total data sent
};

module.exports = {
    fetchFilteredGraphData,
    fetchDevices,
    calculateAndEmitSpeed,
};
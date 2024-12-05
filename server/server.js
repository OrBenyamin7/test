const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const corsAnywhere = require("cors-anywhere");

const app = express();

// You no longer need to manually create the HTTP server here
// Express will handle it and use the `PORT` environment variable
const server = http.createServer(app);

const { formatDate } = require('./Utils/formatDate');
const { fetchFilteredGraphData, fetchDevices, calculateAndEmitSpeed } = require('./DataHandlers/dataHandlers');

// Configure socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Update this based on where your frontend is hosted
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "fiware-service",
      "fiware-servicepath",
      "Link",
      "Accept",
    ],
  },
});

// Enable CORS for all origins on Express
app.use(
  cors({
    origin: "http://localhost:3000", // Update based on your client URL
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "fiware-service",
      "fiware-servicepath",
      "Link",
      "Accept",
    ],
  })
);

// Set up CORS Anywhere for proxied requests
const corsProxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: [],
  removeHeaders: [],
});

// CORS proxy route
app.use("/cors-anywhere", (req, res) => {
  corsProxy.emit("request", req, res);
});

let currentUseCaseValue = "Braude"; // Store current useCaseValue
let refreshInterval = 100;
let fetchDevicesInterval = null;
let speedCalculationInterval = null;

fetchDevices(io);
fetchDevicesInterval = setInterval(() => {
  fetchDevices(io, currentUseCaseValue);
}, refreshInterval);
speedCalculationInterval = setInterval(() => {
  calculateAndEmitSpeed(io); // Pass io to the function
}, refreshInterval);

io.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for 'selectedDeviceData' from the client
  socket.on("selectedDeviceData", (data) => {
    console.log("Selected Device Data received:", data);
    io.emit("selectedDeviceData", data);
  });

  // Listen for 'pinAttribute' from the client
  socket.on("pinAttribute", (data) => {
    console.log("Pinned Attribute Data received:", data);
    io.emit("pinnedAttribute", data);
  });

  // Listen for 'useCaseData' from the client to fetch data based on use case
  socket.on("useCaseData", (data) => {
    console.log("Received use case from client:", data.useCaseValue);
    // Update the current use case value dynamically
    currentUseCaseValue = data.useCaseValue;
    // Fetch devices based on the new use case
    fetchDevices(io, currentUseCaseValue);
  });

  // Listen for 'refreshTime' from the client to update the refresh interval
  socket.on("refreshInterval", (data) => {
    console.log("Received refresh interval from client:", data.refreshInterval);
    // Clear the existing interval
    clearInterval(fetchDevicesInterval);
    clearInterval(speedCalculationInterval);
    // Set the new interval based on the received refresh time
    fetchDevicesInterval = setInterval(() => {
      fetchDevices(io, currentUseCaseValue);
    }, data.refreshInterval);
    speedCalculationInterval = setInterval(() => {
      calculateAndEmitSpeed(io); // Pass io to the function
    }, data.refreshInterval);
  });

  // Listen for 'filterData' event from the client
  socket.on(
    "graphFilterData",
    async ({
      deviceID,
      deviceType,
      attributeKey,
      startDateTime,
      endDateTime,
      lastX,
      color,
    }) => {
      console.log("Received filter data from client:", {
        deviceID,
        deviceType,
        attributeKey,
        startDateTime,
        endDateTime,
        lastX,
        color,
      });

      try {
        // Use the fetchFilteredGraphData function to fetch data from the external API
        const fetchedData = await fetchFilteredGraphData(
          deviceID,
          deviceType,
          new Date(startDateTime),
          new Date(endDateTime),
          lastX,
        );

        const times = fetchedData.index;
        const attributes = fetchedData.attributes;
        const requestedAttribute = attributes.find(
          (attr) => attr.attrName == attributeKey
        );

        const attributeData = requestedAttribute.values;
        const attributeTimes = times;
        // Create a list of { value, timestamp } objects
        const mappedValues = attributeData.map((value, index) => ({
          value,
          timestamp: attributeTimes[index],
        }));

        const requestedData = {
          values: mappedValues,
          created: formatDate(new Date()),
          deviceID: deviceID,
          attributeKey: requestedAttribute.attrName,
          lastX: lastX,
          color: color,
        };
        
        // Emit the fetched data back to the client
        socket.emit("graphFilteredData", requestedData);
      } catch (error) {
        console.error("Error fetching filtered graph data:", error.message);
        socket.emit("error", {
          message: "Failed to fetch filtered graph data.",
        });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Use the environment variable for the port or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

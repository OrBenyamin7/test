# Step 1: Use the official Node.js image as the base image
FROM node:18.16.0

# Step 2: Install OpenVPN and curl
RUN apt-get update && \
    apt-get install -y openvpn curl

# Step 3: Set the working directory inside the container for the server
WORKDIR /app

# Step 4: Copy the server files into /app (this assumes the server directory is in the root of your project)
COPY server/ /app/server/

# Step 5: Install the necessary Node.js dependencies (from package.json)
COPY package*.json ./
RUN npm install

# Step 6: Copy the OpenVPN configuration file into the container
COPY Fiware_Brauden.ovpn /etc/openvpn/Fiware_Brauden.ovpn

# Step 7: Define the start command: first start OpenVPN, then run the Node.js server
CMD openvpn --config /etc/openvpn/Fiware_Brauden.ovpn & node /app/server/server.js

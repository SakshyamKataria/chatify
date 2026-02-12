import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

const app = express();
dotenv.config();

const server = http.createServer(app); // Create an HTTP server using the Express app

// Create a new Socket.IO server and attach it to the HTTP server, with CORS configuration
const io = new Server(server, {
    cors: {
        origin : [process.env.CLIENT_URL],
        credentials : true // Allow credentials (cookies) to be sent with requests from the client
    }, // Allow CORS from the client URL specified in environment variables

})

//apply authentication middleware to all socket.io connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.username);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.username);
    delete userSocketMap[userId];
    //emit the updated list of online users to all clients whenever a user disconnects
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export {io, server, app};
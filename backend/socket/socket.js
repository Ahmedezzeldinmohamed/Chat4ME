import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for message sending event
  socket.on("sendMessage", ({ senderId, recipientId, content }) => {
    const recipientSocketId = userSocketMap[recipientId];
    
    // Check if recipient is online
    if (recipientSocketId) {
      // Send the message to the recipient
      io.to(recipientSocketId).emit("newMessage", {
        senderId,
        content,
      });
    } else {
      // Handle offline recipient (optional)
      console.log(`User ${recipientId} is offline`);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Content-Type check for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send("Anti Thavakai Server is Running! MongoDB Status: " + mongoose.connection.readyState);
});

// Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const chatRoute = require('./routes/chat');

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/chat', chatRoute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, strict in production
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  // Allow multiple connections for the same user (e.g. multiple tabs)
  onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", onlineUsers);
  });

  socket.on("joinRoom", (userId) => {
    socket.join(userId); // Join personal room
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  })

  socket.on("sendMessage", (message) => {
    if (message.conversationId) {
      io.to(message.conversationId).emit("message", message);
    }
  });

  // --- WebRTC Signaling ---
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const user = getUser(userToCall);
    if (user) {
      io.to(user.socketId).emit("callUser", { signal: signalData, from, name });
    } else {
      // Fallback to room if mapped user not found (though reliability might vary)
      io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    }
  });

  socket.on("answerCall", (data) => {
    const user = getUser(data.to);
    if (user) {
      io.to(user.socketId).emit("callAccepted", data.signal);
    } else {
      io.to(data.to).emit("callAccepted", data.signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    const user = getUser(to);
    if (user) {
      io.to(user.socketId).emit("endCall");
    } else {
      io.to(to).emit("endCall");
    }
  });
  // ------------------------

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
    socket.broadcast.emit("callEnded");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

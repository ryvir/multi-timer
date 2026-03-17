const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  path: "/timer/socket.io",
  cors: {
    origin: ["https://ryanvir.com", "https://www.ryanvir.com"],
    methods: ["GET", "POST"],
  },
});

// In-memory store for timer rooms
// roomCode => timerState object
const rooms = {};

// Helper to generate a random 4-character code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const getDefaultTimer = () => ({
  status: "PAUSED", // 'RUNNING' or 'PAUSED'
  mode: "UP", // 'UP' or 'DOWN'
  serverStartTime: 0, // Date.now() when last started
  accumulatedTime: 0, // Total ms elapsed when paused
  duration: 60 * 1000, // 1 minute default for countdown
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Time Synchronization (NTP-like ping)
  socket.on("sync_time", (clientTime, callback) => {
    // Respond immediately with the server's precise timestamp
    callback(Date.now());
  });

  // 2. Room Management
  socket.on("create_room", (callback) => {
    let code = generateCode();
    while (rooms[code]) {
      code = generateCode(); // Ensure unique
    }
    rooms[code] = getDefaultTimer();

    socket.join(code);
    console.log(`Room created: ${code}`);
    callback({ code, state: rooms[code] });
  });

  socket.on("join_room", (code, callback) => {
    const uppercaseCode = code.toUpperCase();
    if (rooms[uppercaseCode]) {
      socket.join(uppercaseCode);
      console.log(`User ${socket.id} joined room: ${uppercaseCode}`);
      callback({ success: true, state: rooms[uppercaseCode] });

      // Notify others in room
      socket.to(uppercaseCode).emit("user_joined");
    } else {
      callback({ success: false, message: "Room not found" });
    }
  });

  // 3. Timer Controls
  socket.on("start_timer", (code) => {
    const room = rooms[code];
    if (room && room.status === "PAUSED") {
      room.status = "RUNNING";
      room.serverStartTime = Date.now();

      io.to(code).emit("timer_state_update", room);
    }
  });

  socket.on("pause_timer", (code) => {
    const room = rooms[code];
    if (room && room.status === "RUNNING") {
      const now = Date.now();
      room.status = "PAUSED";
      room.accumulatedTime += now - room.serverStartTime;

      io.to(code).emit("timer_state_update", room);
    }
  });

  socket.on("stop_timer", (code) => {
    const room = rooms[code];
    if (room) {
      room.status = "PAUSED";
      room.accumulatedTime = 0;
      room.serverStartTime = 0;

      io.to(code).emit("timer_state_update", room);
    }
  });

  socket.on("set_mode", ({ code, mode, duration }) => {
    const room = rooms[code];
    if (room) {
      room.mode = mode; // 'UP' or 'DOWN'
      if (duration) {
        room.duration = duration;
      }
      // Usually resetting state entirely when changing mode clarifies UX
      room.status = "PAUSED";
      room.accumulatedTime = 0;
      room.serverStartTime = 0;

      io.to(code).emit("timer_state_update", room);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

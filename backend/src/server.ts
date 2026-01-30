import * as express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";
import http from "http"; // Import http module
import { Server as SocketIOServer } from "socket.io"; // Import Socket.IO Server
import { connectDatabase } from "./config/database";
import { sequelize } from "./models";
import apiRouter from "./routes";

dotenv.config();

const app = express.default();
const httpServer = http.createServer(app); // Create HTTP server
export const io = new SocketIOServer(httpServer, { // Initialize Socket.IO
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow frontend origin
    methods: ["GET", "POST"],
  },
});

// Handle new Socket.IO connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a room for a specific diamond bid
  socket.on("joinDiamondBidRoom", (diamondBidId: number) => {
    socket.join(`diamondBid:${diamondBidId}`);
    console.log(`Client ${socket.id} joined diamondBid:${diamondBidId}`);
  });

  // Join a room for a specific user (for auto-bid updates)
  socket.on("joinUserRoom", (userId: number) => {
    socket.join(`user:${userId}`);
    console.log(`Client ${socket.id} joined user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDatabase();
  await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

void start();


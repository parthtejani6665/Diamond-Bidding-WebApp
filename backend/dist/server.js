"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http")); // Import http module
const socket_io_1 = require("socket.io"); // Import Socket.IO Server
const database_1 = require("./config/database");
const models_1 = require("./models");
const routes_1 = __importDefault(require("./routes"));
dotenv.config();
const app = express.default();
const httpServer = http_1.default.createServer(app); // Create HTTP server
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow frontend origin
        methods: ["GET", "POST"],
    },
});
// Handle new Socket.IO connections
exports.io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Join a room for a specific diamond bid
    socket.on("joinDiamondBidRoom", (diamondBidId) => {
        socket.join(`diamondBid:${diamondBidId}`);
        console.log(`Client ${socket.id} joined diamondBid:${diamondBidId}`);
    });
    // Join a room for a specific user (for auto-bid updates)
    socket.on("joinUserRoom", (userId) => {
        socket.join(`user:${userId}`);
        console.log(`Client ${socket.id} joined user:${userId}`);
    });
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
app.use((0, cors_1.default)());
app.use(express.json());
app.use("/uploads", express.static(path_1.default.resolve(process.cwd(), "uploads")));
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api", routes_1.default);
const PORT = process.env.PORT || 4000;
const start = async () => {
    await (0, database_1.connectDatabase)();
    await models_1.sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
    httpServer.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};
void start();
//# sourceMappingURL=server.js.map
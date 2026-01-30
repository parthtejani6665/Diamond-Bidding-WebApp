"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.me = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const SALT_ROUNDS = 10;
const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email already in use" });
        }
        const hashed = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const user = await User_1.User.create({
            email,
            password: hashed,
            role: role || "user",
        });
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return res.status(201).json({
            user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive },
            token,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to register user" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const passwordValid = await bcrypt_1.default.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return res.json({
            user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive },
            token,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to login" });
    }
};
exports.login = login;
const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json({ user: req.user });
};
exports.me = me;
const logout = async (_req, res) => {
    // For JWT, logout is handled client-side by removing the token.
    return res.status(200).json({ message: "Logged out" });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map
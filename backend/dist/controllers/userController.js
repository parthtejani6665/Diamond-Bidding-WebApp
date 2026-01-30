"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.updateUser = exports.createUser = exports.listUsers = void 0;
const sequelize_1 = require("sequelize");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const params_1 = require("../utils/params");
const SALT_ROUNDS = 10;
const listUsers = async (req, res) => {
    try {
        const currentAdminId = req.user.id;
        const users = await User_1.User.findAll({
            where: { id: { [sequelize_1.Op.ne]: currentAdminId } },
            attributes: ["id", "email", "role", "isActive", "createdAt", "updatedAt"],
            order: [["createdAt", "DESC"]],
        });
        return res.json({ users });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
};
exports.listUsers = listUsers;
const createUser = async (req, res) => {
    try {
        const { email, password, role, isActive } = req.body;
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
            isActive: typeof isActive === "boolean" ? isActive : true,
        });
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create user" });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const { email, role, isActive } = req.body;
        const user = await User_1.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (email && email !== user.email) {
            const existing = await User_1.User.findOne({
                where: { email, id: { [sequelize_1.Op.ne]: user.id } },
            });
            if (existing) {
                return res.status(409).json({ message: "Email already in use" });
            }
            user.email = email;
        }
        if (typeof role === "string") {
            user.role = role;
        }
        if (typeof isActive === "boolean") {
            user.isActive = isActive;
        }
        await user.save();
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
const toggleUserStatus = async (req, res) => {
    try {
        const id = (0, params_1.parseIdParam)(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const user = await User_1.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isActive = !user.isActive;
        await user.save();
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to toggle user status" });
    }
};
exports.toggleUserStatus = toggleUserStatus;
//# sourceMappingURL=userController.js.map
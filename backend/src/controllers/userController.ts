import { Request, Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import bcrypt from "bcrypt";
import { parseIdParam } from "../utils/params";

const SALT_ROUNDS = 10;

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentAdminId = req.user!.id;
    const users = await User.findAll({
      where: { id: { [Op.ne]: currentAdminId } },
      attributes: ["id", "email", "role", "isActive", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role, isActive } = req.body as {
      email: string;
      password: string;
      role?: "admin" | "user";
      isActive?: boolean;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { email, role, isActive } = req.body as {
      email?: string;
      role?: "admin" | "user";
      isActive?: boolean;
    };

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({
        where: { email, id: { [Op.ne]: user.id } },
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseIdParam((req.params as { id?: unknown }).id);
    if (!id) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const user = await User.findByPk(id);
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to toggle user status" });
  }
};


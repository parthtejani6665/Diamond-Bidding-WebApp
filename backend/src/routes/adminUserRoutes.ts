import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  listUsers,
  createUser,
  updateUser,
  toggleUserStatus,
} from "../controllers/userController";

const router = Router();

// All routes here are protected and admin-only
router.use(authMiddleware, requireRole("admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);

export default router;


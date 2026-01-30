import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { listAllResults } from "../controllers/resultController";

const router = Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/", listAllResults);

export default router;

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { diamondImageUpload } from "../middleware/upload";
import {
  listDiamonds,
  createDiamond,
  updateDiamond,
  deleteDiamond,
} from "../controllers/diamondController";

const router = Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/", listDiamonds);
router.post("/", diamondImageUpload.single("diamondImage"), createDiamond);
router.put("/:id", updateDiamond);
router.delete("/:id", deleteDiamond);

export default router;

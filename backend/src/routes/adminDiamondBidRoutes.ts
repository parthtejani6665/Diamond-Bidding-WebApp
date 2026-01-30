import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { diamondImageUpload } from "../middleware/upload";
import {
  createDiamondBid,
  listDiamondBids,
  getDiamondBidById,
  updateDiamondBid,
  deleteDiamondBid,
} from "../controllers/diamondBidController";
import {
  getAllBidsForDiamond,
  getBidHistoryForDiamond,
  declareResult,
} from "../controllers/resultController";

const router = Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/", listDiamondBids);
router.post("/", diamondImageUpload.single("diamondImage"), createDiamondBid);
router.get("/:id", getDiamondBidById);
router.put("/:id", updateDiamondBid);
router.delete("/:id", deleteDiamondBid);
router.get("/:id/all-bids", getAllBidsForDiamond);
router.get("/:id/bid-history", getBidHistoryForDiamond);
router.post("/:id/declare-result", declareResult);

export default router;


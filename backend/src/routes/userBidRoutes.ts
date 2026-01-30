import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  listActiveDiamondBids,
  placeBid,
  updateBid,
  getBidHistory,
  listMyBids,
  getAutoBid,
  setAutoBid,
  deleteAutoBid,
} from "../controllers/userBidController";

const router = Router();

router.use(authMiddleware);

router.get("/active", listActiveDiamondBids);
router.get("/my-bids", listMyBids);
router.get("/:diamondBidId/auto-bid", getAutoBid);
router.post("/:diamondBidId/auto-bid", setAutoBid);
router.delete("/:diamondBidId/auto-bid", deleteAutoBid);
router.post("/:diamondBidId", placeBid);
router.put("/:id", updateBid);
router.get("/:id/history", getBidHistory);

export default router;


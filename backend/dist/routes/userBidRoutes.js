"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userBidController_1 = require("../controllers/userBidController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/active", userBidController_1.listActiveDiamondBids);
router.get("/my-bids", userBidController_1.listMyBids);
router.get("/:diamondBidId/auto-bid", userBidController_1.getAutoBid);
router.post("/:diamondBidId/auto-bid", userBidController_1.setAutoBid);
router.delete("/:diamondBidId/auto-bid", userBidController_1.deleteAutoBid);
router.post("/:diamondBidId", userBidController_1.placeBid);
router.put("/:id", userBidController_1.updateBid);
router.get("/:id/history", userBidController_1.getBidHistory);
exports.default = router;
//# sourceMappingURL=userBidRoutes.js.map
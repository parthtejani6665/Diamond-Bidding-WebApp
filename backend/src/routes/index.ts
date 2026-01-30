import { Router } from "express";
import authRoutes from "./authRoutes";
import adminUserRoutes from "./adminUserRoutes";
import adminDiamondBidRoutes from "./adminDiamondBidRoutes";
import adminDiamondRoutes from "./adminDiamondRoutes";
import adminResultRoutes from "./adminResultRoutes";
import userBidRoutes from "./userBidRoutes";
import resultRoutes from "./resultRoutes";

const router = Router();

router.use("/auth", authRoutes);
// Mount specific /admin/* routes before generic /admin so they are matched first
router.use("/admin/results", adminResultRoutes);
router.use("/admin/diamond-bids", adminDiamondBidRoutes);
router.use("/admin/diamonds", adminDiamondRoutes);
router.use("/admin", adminUserRoutes);
router.use("/bids", userBidRoutes);
router.use("/results", resultRoutes);

export default router;

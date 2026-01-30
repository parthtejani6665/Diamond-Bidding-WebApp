"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const adminUserRoutes_1 = __importDefault(require("./adminUserRoutes"));
const adminDiamondBidRoutes_1 = __importDefault(require("./adminDiamondBidRoutes"));
const adminDiamondRoutes_1 = __importDefault(require("./adminDiamondRoutes"));
const adminResultRoutes_1 = __importDefault(require("./adminResultRoutes"));
const userBidRoutes_1 = __importDefault(require("./userBidRoutes"));
const resultRoutes_1 = __importDefault(require("./resultRoutes"));
const router = (0, express_1.Router)();
router.use("/auth", authRoutes_1.default);
// Mount specific /admin/* routes before generic /admin so they are matched first
router.use("/admin/results", adminResultRoutes_1.default);
router.use("/admin/diamond-bids", adminDiamondBidRoutes_1.default);
router.use("/admin/diamonds", adminDiamondRoutes_1.default);
router.use("/admin", adminUserRoutes_1.default);
router.use("/bids", userBidRoutes_1.default);
router.use("/results", resultRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const upload_1 = require("../middleware/upload");
const diamondController_1 = require("../controllers/diamondController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, requireRole_1.requireRole)("admin"));
router.get("/", diamondController_1.listDiamonds);
router.post("/", upload_1.diamondImageUpload.single("diamondImage"), diamondController_1.createDiamond);
router.put("/:id", diamondController_1.updateDiamond);
router.delete("/:id", diamondController_1.deleteDiamond);
exports.default = router;
//# sourceMappingURL=adminDiamondRoutes.js.map
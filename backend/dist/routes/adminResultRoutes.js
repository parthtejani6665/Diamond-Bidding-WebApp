"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const resultController_1 = require("../controllers/resultController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, requireRole_1.requireRole)("admin"));
router.get("/", resultController_1.listAllResults);
exports.default = router;
//# sourceMappingURL=adminResultRoutes.js.map
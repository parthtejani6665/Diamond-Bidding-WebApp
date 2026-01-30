"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const resultController_1 = require("../controllers/resultController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/my-results", resultController_1.getMyResults);
exports.default = router;
//# sourceMappingURL=resultRoutes.js.map
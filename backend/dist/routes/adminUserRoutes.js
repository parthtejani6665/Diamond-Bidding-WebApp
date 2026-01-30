"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// All routes here are protected and admin-only
router.use(auth_1.authMiddleware, (0, requireRole_1.requireRole)("admin"));
router.get("/users", userController_1.listUsers);
router.post("/users", userController_1.createUser);
router.put("/users/:id", userController_1.updateUser);
router.patch("/users/:id/toggle-status", userController_1.toggleUserStatus);
exports.default = router;
//# sourceMappingURL=adminUserRoutes.js.map
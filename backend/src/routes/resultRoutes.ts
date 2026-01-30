import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyResults } from "../controllers/resultController";

const router = Router();

router.use(authMiddleware);

router.get("/my-results", getMyResults);

export default router;


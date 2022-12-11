import { Router } from "express";
import userRoutes from "./user";
import googleRoutes from "./google";

const router = Router();

router.use("/users", userRoutes);
router.use("/google", googleRoutes);

export default router;

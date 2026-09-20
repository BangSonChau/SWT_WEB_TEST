import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

// Định nghĩa endpoint: POST /login
router.post("/login", authController.login);

export default router;

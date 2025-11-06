import express from "express";
import { registerUser, loginUser } from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, (req, res) => res.json({ user_id: req.user.user_id, roles: req.user.roles }));
export default router;

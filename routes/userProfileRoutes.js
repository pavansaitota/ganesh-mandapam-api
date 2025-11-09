import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { getMyProfile, updateMyProfile, getUserById } from "../controllers/userProfileController.js";

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

// only leaders can see other user profiles
router.get("/:id", verifyToken, allowRoles("President","Vice President","Treasurer","Secretary"), getUserById);

export default router;

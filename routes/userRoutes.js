import express from "express";
import {
  registerUser,
  loginUser,
  getNearbyMandapams,
} from "../controllers/usersController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/nearby-mandapams", getNearbyMandapams);

export default router;

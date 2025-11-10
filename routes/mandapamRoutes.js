import express from "express";
import {
  registerMandapam,
  getMandapam,
  getAllMandapams
} from "../controllers/mandapamController.js";

const router = express.Router();

// register
router.post("/", registerMandapam);

// get by ID
router.get("/:id", getMandapam);

// get all
router.get("/", getAllMandapams);

export default router;

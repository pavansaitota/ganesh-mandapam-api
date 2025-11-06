import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleGuard.js";
import { addExpense, approveExpense, listExpenses } from "../controllers/expenseController.js";

const router = express.Router();
router.get("/", verifyToken, listExpenses);
router.post("/", verifyToken, allowRoles("President","Vice President","Treasurer"), addExpense);
router.put("/:id/status", verifyToken, allowRoles("President","Vice President","Treasurer"), approveExpense);
export default router;

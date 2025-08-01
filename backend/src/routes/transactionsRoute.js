import express from "express";
import { addTransaction, deleteTransaction, getTransactionsByUserId, getTransactionSummaryByUserId } from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/:userId", getTransactionsByUserId);

router.post("/", addTransaction);

router.delete("/:id", deleteTransaction);

router.get("/summary/:userId", getTransactionSummaryByUserId);

export default router;
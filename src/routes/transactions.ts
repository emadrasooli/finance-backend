import { Router } from "express";
import { createTransaction, deleteTransaction, getSummary, getTransactionById, getTransactions, updateTransaction } from "../controllers/transactionsController";


const router = Router();

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/summary", getSummary);
router.get("/:id", getTransactionById)
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;

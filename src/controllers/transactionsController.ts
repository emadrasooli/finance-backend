import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import db from "../db";

// Create transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { type, amount, description, category } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ success: false, error: "Type and amount are required" });
    }
    if (!["deposit", "withdraw"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid transaction type" });
    }

    const [result]: any = await db.query(
      "INSERT INTO transactions (type, amount, description, category) VALUES (?, ?, ?, ?)",
      [type, amount, description, category]
    );

    const [inserted]: any = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while fetching transaction" });
  }
};



// Get all transactions
export const getTransactions = async (_: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM transactions ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// Update transaction
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category } = req.body;

    // Validate
    if (!type || !amount) {
      return res.status(400).json({ error: "Type and amount are required" });
    }

    if (!["deposit", "withdraw"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid transaction type" });
    }

    const [existing]: any = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await db.query(
      `UPDATE transactions 
       SET type = ?, amount = ?, description = ?, category = ?, updated_at = NOW() 
       WHERE id = ?`,
      [type, amount, description, category, id]
    );

    const [updated]: any = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while updating transaction" });
  }
};

// Delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: any = await db.query("SELECT * FROM transactions WHERE id = ?", [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    await db.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ success: true, message: "Transaction deleted", data: existing[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// Balance, sums
export const getSummary = async (_: Request, res: Response) => {
  try {
    const [depositRows] = await db.query<RowDataPacket[]>(
      "SELECT SUM(amount) as totalDeposit FROM transactions WHERE type='deposit'"
    );

    const [withdrawRows] = await db.query<RowDataPacket[]>(
      "SELECT SUM(amount) as totalWithdraw FROM transactions WHERE type='withdraw'"
    );

    const totalDeposit = depositRows[0]?.totalDeposit || 0;
    const totalWithdraw = withdrawRows[0]?.totalWithdraw || 0;

    const balance = totalDeposit - totalWithdraw;

    res.json({ success: true, data: { totalDeposit, totalWithdraw, balance } });
  } catch (error) {
    res.status(500).json({ error });
  }
};

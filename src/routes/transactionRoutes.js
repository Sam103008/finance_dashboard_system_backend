const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const { protect, authorize } = require("../middleware/auth");
const { transactionValidator } = require("../middleware/validators");

// All transaction routes require authentication
router.use(protect);

// READ - Viewer, Analyst, Admin can all view
router.get("/", authorize("viewer", "analyst", "admin"), getAllTransactions);
router.get("/:id", authorize("viewer", "analyst", "admin"), getTransactionById);

// WRITE - Admin only
router.post("/", authorize("admin"), transactionValidator, createTransaction);
router.put("/:id", authorize("admin"), transactionValidator, updateTransaction);
router.delete("/:id", authorize("admin"), deleteTransaction);

module.exports = router;

const Transaction = require("../models/Transaction");

// ─── @route   POST /api/transactions ─────────────────────────────────────────
// ─── @access  Admin only
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      createdBy: req.user._id,
    });

    await transaction.populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/transactions ──────────────────────────────────────────
// ─── @access  Admin, Analyst, Viewer (all authenticated)
const getAllTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 10,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const filter = {};

    // Type filter
    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        filter.date.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    // Search by title or notes
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;
    const allowedSortFields = ["date", "amount", "createdAt", "title"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "date";

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("createdBy", "name email")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/transactions/:id ──────────────────────────────────────
// ─── @access  Admin, Analyst, Viewer
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// ─── @route   PUT /api/transactions/:id ──────────────────────────────────────
// ─── @access  Admin only
const updateTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { title, amount, type, category, date, notes },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   DELETE /api/transactions/:id ───────────────────────────────────
// ─── @access  Admin only (Soft Delete)
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully (soft delete)",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};

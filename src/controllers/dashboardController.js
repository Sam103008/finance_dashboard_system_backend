const Transaction = require("../models/Transaction");

// ─── @route   GET /api/dashboard/summary ─────────────────────────────────────
// ─── @access  Admin, Analyst, Viewer
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = buildDateFilter(startDate, endDate);

    const result = await Transaction.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = result.find((r) => r._id === "income") || { total: 0, count: 0 };
    const expense = result.find((r) => r._id === "expense") || { total: 0, count: 0 };

    res.status(200).json({
      success: true,
      summary: {
        totalIncome: income.total,
        totalExpenses: expense.total,
        netBalance: income.total - expense.total,
        incomeCount: income.count,
        expenseCount: expense.count,
        totalTransactions: income.count + expense.count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/dashboard/category-breakdown ──────────────────────────
// ─── @access  Admin, Analyst
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    const matchFilter = { isDeleted: false, ...buildDateFilter(startDate, endDate) };
    if (type && ["income", "expense"].includes(type)) matchFilter.type = type;

    const breakdown = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $group: {
          _id: "$_id.type",
          categories: {
            $push: {
              category: "$_id.category",
              total: "$total",
              count: "$count",
            },
          },
          typeTotal: { $sum: "$total" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/dashboard/monthly-trends ──────────────────────────────
// ─── @access  Admin, Analyst
const getMonthlyTrends = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const trends = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Build a full 12-month structure (fill missing months with 0)
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const incomeData = trends.find((t) => t._id.month === month && t._id.type === "income");
      const expenseData = trends.find((t) => t._id.month === month && t._id.type === "expense");
      return {
        month,
        monthName: new Date(year, i, 1).toLocaleString("default", { month: "long" }),
        income: incomeData?.total || 0,
        expense: expenseData?.total || 0,
        net: (incomeData?.total || 0) - (expenseData?.total || 0),
      };
    });

    res.status(200).json({
      success: true,
      year: parseInt(year),
      trends: months,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/dashboard/weekly-trends ───────────────────────────────
// ─── @access  Admin, Analyst
const getWeeklyTrends = async (req, res, next) => {
  try {
    // Last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const trends = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: eightWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$date" },
            year: { $isoWeekYear: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/dashboard/recent-activity ─────────────────────────────
// ─── @access  Admin, Analyst, Viewer
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50

    const transactions = await Transaction.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Build date filter from query params ──────────────────────────────
const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};

  const filter = { date: {} };
  if (startDate) filter.date.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.date.$lte = end;
  }
  return filter;
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};

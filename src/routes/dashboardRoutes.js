const express = require("express");
const router = express.Router();

const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require("../controllers/dashboardController");

const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// Summary - all roles can see
router.get("/summary", authorize("viewer", "analyst", "admin"), getSummary);

// Recent activity - all roles can see
router.get("/recent-activity", authorize("viewer", "analyst", "admin"), getRecentActivity);

// Detailed analytics - analyst and admin only
router.get("/category-breakdown", authorize("analyst", "admin"), getCategoryBreakdown);
router.get("/monthly-trends", authorize("analyst", "admin"), getMonthlyTrends);
router.get("/weekly-trends", authorize("analyst", "admin"), getWeeklyTrends);

module.exports = router;

const express = require("express");
const router = express.Router();

const { register, login, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerValidator, loginValidator } = require("../middleware/validators");

// Public routes
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

module.exports = router;

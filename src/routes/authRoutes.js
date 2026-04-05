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



/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             password: "secret123"
 *             role: "viewer"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "admin@finance.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Login successful — copy token from response
 *       401:
 *         description: Invalid credentials
 */
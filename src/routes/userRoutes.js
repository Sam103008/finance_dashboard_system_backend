const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");
const { updateUserValidator } = require("../middleware/validators");

// All user management routes require authentication + admin role
router.use(protect, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUserValidator, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

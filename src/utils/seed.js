require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const connectDB = require("../config/db");

const seedUsers = [
  {
    name: "Super Admin",
    email: "admin@finance.com",
    password: "admin123",
    role: "admin",
    status: "active",
  },
  {
    name: "Alice Analyst",
    email: "analyst@finance.com",
    password: "analyst123",
    role: "analyst",
    status: "active",
  },
  {
    name: "Victor Viewer",
    email: "viewer@finance.com",
    password: "viewer123",
    role: "viewer",
    status: "active",
  },
];

const categories = {
  income: ["salary", "freelance", "investment", "business", "other"],
  expense: ["food", "transport", "utilities", "entertainment", "healthcare", "shopping", "rent"],
};

const generateTransactions = (adminId) => {
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.55;
    const type = isIncome ? "income" : "expense";
    const categoryList = categories[type];
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];

    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months

    transactions.push({
      title: `${type === "income" ? "Received" : "Paid for"} ${category}`,
      amount: parseFloat((Math.random() * 9900 + 100).toFixed(2)),
      type,
      category,
      date,
      notes: `Auto-generated seed transaction #${i + 1}`,
      createdBy: adminId,
    });
  }

  return transactions;
};

const seed = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Transaction.deleteMany({});

    console.log("👤 Creating users...");
    const createdUsers = await User.create(seedUsers);
    const admin = createdUsers.find((u) => u.role === "admin");

    console.log("💰 Creating transactions...");
    await Transaction.create(generateTransactions(admin._id));

    console.log("\n✅ Seed complete!\n");
    console.log("─────────────────────────────────────");
    console.log("  Test Credentials:");
    console.log("  Admin    → admin@finance.com    / admin123");
    console.log("  Analyst  → analyst@finance.com  / analyst123");
    console.log("  Viewer   → viewer@finance.com   / viewer123");
    console.log("─────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();

# Finance Dashboard Backend

A RESTful backend API for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**. Supports role-based access control, financial record management, and dashboard analytics.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Database     | MongoDB + Mongoose ODM            |
| Auth         | JWT (JSON Web Tokens)             |
| Validation   | express-validator                 |
| Security     | bcryptjs, express-rate-limit      |
| Dev Tool     | nodemon                           |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, me, change-password
│   │   ├── userController.js      # Admin: manage users
│   │   ├── transactionController.js # CRUD for financial records
│   │   └── dashboardController.js # Summary & analytics
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + authorize (RBAC)
│   │   ├── errorHandler.js        # Central error handler + 404
│   │   └── validators.js          # express-validator rules
│   ├── models/
│   │   ├── User.js                # User schema (name, email, role, status)
│   │   └── Transaction.js         # Transaction schema with soft delete
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   └── seed.js                # Demo data seeder
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
├── .env.example
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd finance-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed Demo Data (Optional but Recommended)

```bash
npm run seed
```

This creates 3 demo users and 60 sample transactions:

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@finance.com      | admin123    |
| Analyst | analyst@finance.com    | analyst123  |
| Viewer  | viewer@finance.com     | viewer123   |

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## Role Permissions Matrix

| Action                          | Viewer | Analyst | Admin |
|---------------------------------|--------|---------|-------|
| Login / Register                | ✅     | ✅      | ✅    |
| View transactions               | ✅     | ✅      | ✅    |
| View dashboard summary          | ✅     | ✅      | ✅    |
| View recent activity            | ✅     | ✅      | ✅    |
| Category breakdown              | ❌     | ✅      | ✅    |
| Monthly / Weekly trends         | ❌     | ✅      | ✅    |
| Create / Update / Delete records| ❌     | ❌      | ✅    |
| Manage users                    | ❌     | ❌      | ✅    |

---

## API Reference

### Base URL: `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth Routes `/api/auth`

| Method | Endpoint               | Access  | Description               |
|--------|------------------------|---------|---------------------------|
| POST   | `/register`            | Public  | Register a new user       |
| POST   | `/login`               | Public  | Login and get JWT token   |
| GET    | `/me`                  | Private | Get current user profile  |
| PATCH  | `/change-password`     | Private | Change own password       |

#### POST `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "viewer"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "name": "Super Admin", "role": "admin", ... }
}
```

---

### User Routes `/api/users` — Admin Only

| Method | Endpoint     | Description                          |
|--------|--------------|--------------------------------------|
| GET    | `/`          | List all users (filter + paginate)   |
| GET    | `/:id`       | Get user by ID                       |
| PATCH  | `/:id`       | Update user (name, role, status)     |
| DELETE | `/:id`       | Delete user                          |

#### GET `/api/users?role=analyst&status=active&page=1&limit=10`

#### PATCH `/api/users/:id`
```json
{
  "role": "analyst",
  "status": "inactive"
}
```

---

### Transaction Routes `/api/transactions`

| Method | Endpoint | Access              | Description               |
|--------|----------|---------------------|---------------------------|
| GET    | `/`      | Viewer/Analyst/Admin| List all (filter + page)  |
| GET    | `/:id`   | Viewer/Analyst/Admin| Get one transaction       |
| POST   | `/`      | Admin only          | Create transaction        |
| PUT    | `/:id`   | Admin only          | Update transaction        |
| DELETE | `/:id`   | Admin only          | Soft delete transaction   |

#### POST `/api/transactions`
```json
{
  "title": "Monthly Salary",
  "amount": 75000,
  "type": "income",
  "category": "salary",
  "date": "2025-01-15",
  "notes": "January salary credited"
}
```

#### GET `/api/transactions` — Query Parameters

| Param      | Example              | Description                |
|------------|----------------------|----------------------------|
| type       | `?type=expense`      | Filter by income/expense   |
| category   | `?category=food`     | Filter by category         |
| startDate  | `?startDate=2025-01-01` | From date               |
| endDate    | `?endDate=2025-12-31`| To date                    |
| minAmount  | `?minAmount=1000`    | Minimum amount             |
| maxAmount  | `?maxAmount=50000`   | Maximum amount             |
| search     | `?search=salary`     | Search in title/notes      |
| page       | `?page=2`            | Page number (default: 1)   |
| limit      | `?limit=20`          | Per page (default: 10)     |
| sortBy     | `?sortBy=amount`     | Sort field                 |
| order      | `?order=asc`         | asc or desc                |

**Available categories:**
- Income: `salary`, `freelance`, `investment`, `business`, `other`
- Expense: `food`, `transport`, `utilities`, `entertainment`, `healthcare`, `shopping`, `rent`, `other`

---

### Dashboard Routes `/api/dashboard`

| Method | Endpoint              | Access              | Description                  |
|--------|-----------------------|---------------------|------------------------------|
| GET    | `/summary`            | All roles           | Total income, expense, balance|
| GET    | `/recent-activity`    | All roles           | Latest N transactions        |
| GET    | `/category-breakdown` | Analyst + Admin     | Spending by category         |
| GET    | `/monthly-trends`     | Analyst + Admin     | Month-by-month breakdown     |
| GET    | `/weekly-trends`      | Analyst + Admin     | Last 8 weeks breakdown       |

#### GET `/api/dashboard/summary?startDate=2025-01-01&endDate=2025-12-31`
```json
{
  "success": true,
  "summary": {
    "totalIncome": 450000,
    "totalExpenses": 185000,
    "netBalance": 265000,
    "incomeCount": 18,
    "expenseCount": 42,
    "totalTransactions": 60
  }
}
```

#### GET `/api/dashboard/monthly-trends?year=2025`
```json
{
  "success": true,
  "year": 2025,
  "trends": [
    { "month": 1, "monthName": "January", "income": 75000, "expense": 22000, "net": 53000 },
    { "month": 2, "monthName": "February", "income": 80000, "expense": 18000, "net": 62000 },
    ...
  ]
}
```

#### GET `/api/dashboard/recent-activity?limit=5`

#### GET `/api/dashboard/category-breakdown?type=expense`

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "type", "message": "Type must be income or expense" }
  ]
}
```

### HTTP Status Codes Used

| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success                          |
| 201  | Resource created                 |
| 400  | Bad request / validation error   |
| 401  | Unauthorized (no/invalid token)  |
| 403  | Forbidden (insufficient role)    |
| 404  | Resource not found               |
| 409  | Conflict (e.g. duplicate email)  |
| 429  | Too many requests (rate limited) |
| 500  | Internal server error            |

---

## Design Decisions & Assumptions

### 1. Soft Delete for Transactions
Transactions are never permanently deleted. A `isDeleted: true` flag is set and a `deletedAt` timestamp is stored. This preserves financial history and allows future audit trails.

### 2. Role Assignment on Registration
Any role can be assigned during registration. In a production system, this would be restricted — only admins could assign the `admin` role. For this assessment, it's kept open for easy testing.

### 3. Password Never Returned
The `password` field has `select: false` on the Mongoose schema. It is only fetched explicitly when needed (login, change-password).

### 4. Rate Limiting
100 requests per 15 minutes per IP on all `/api/*` routes. This prevents abuse and brute-force attacks.

### 5. Analyst vs Viewer Access
- **Viewer**: Can see transactions and basic summary. Meant for stakeholders who just need a read-only view.
- **Analyst**: Can additionally access category breakdowns, monthly trends, and weekly trends — deeper analytical endpoints.

### 6. Pagination Defaults
Default page size is 10, configurable via `?limit=`. Maximum for `recent-activity` is capped at 50 to prevent large payloads.

### 7. Indexes on Transaction Model
Compound indexes on `{ type, category, date }` and `{ createdBy, date }` ensure fast filtered queries as data grows.

---

## Optional Enhancements Implemented

- ✅ JWT Authentication
- ✅ Pagination on all list endpoints
- ✅ Search support on transactions (title + notes)
- ✅ Soft delete with `isDeleted` + `deletedAt`
- ✅ Rate limiting (100 req / 15 min)
- ✅ Seed script with realistic demo data
- ✅ Health check endpoint (`GET /health`)

---

## Health Check

```
GET /health
```
```json
{
  "success": true,
  "message": "Finance Dashboard API is running",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

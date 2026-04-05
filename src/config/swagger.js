const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description: "Role-based Finance Dashboard Backend — Node.js + Express + MongoDB",
    },
    servers: [
      { url: "https://finance-dashboard-system-backend-6qh0.onrender.com/api-docs", description: "Production" },
      { url: "http://localhost:5000/api", description: "Local Dev" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Login karo → token copy karo → 'Authorize' button mein paste karo"
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
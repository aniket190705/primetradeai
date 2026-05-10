const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const routes = require("./routes");
const errorHandler = require("./middleware/errorMiddleware");
const swaggerSpec = require("./utils/swagger");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Serverless-safe DB + Redis bootstrap
//
// On Vercel, server.js is never executed — there is no "boot" phase.
// Instead, we lazily connect on the first request and reuse the connection
// on subsequent warm invocations (Mongoose caches the connection internally).
// ---------------------------------------------------------------------------
let redisInitialised = false;

app.use(async (req, res, next) => {
  try {
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (!redisInitialised) {
      redisInitialised = true;
      connectRedis().catch(() => {
        console.log("Redis not available, running without cache");
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;

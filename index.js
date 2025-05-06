import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import limiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import { connectMongo } from "./config/mongo.js";
import { connectTurso, db } from "./config/turso.js";
import apiRoutes from "./api/v1/routes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Global middlewares
app.use(helmet());
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://mini-project-frontend-navy.vercel.app/",
  ], //your frontend domain
  credentials: true, //allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// Centralized routes
app.use("/", apiRoutes(db));
app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectMongo();
    await connectTurso();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} 😊`);
    });
  } catch (err) {
    console.err("Startup error", err);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
  process.exit(1);
});

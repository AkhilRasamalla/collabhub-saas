import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import { config } from "./config/app.config";
import { connectDatabase } from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";

import "./config/passport.config";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";

const app = express();

/* =======================
   1️⃣ CORS (FIXED)
   ======================= */
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* =======================
   2️⃣ BODY PARSERS
   ======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   3️⃣ SESSION (CORRECT)
   ======================= */
app.use(
  session({
    name: "collabhub.sid",
    secret: config.SESSION_SECRET!, // must exist
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,        // 🔴 MUST be false for localhost
      sameSite: "lax",      // 🔴 MUST be lax for localhost
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

/* =======================
   4️⃣ PASSPORT
   ======================= */
app.use(passport.initialize());
app.use(passport.session());

/* =======================
   5️⃣ ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/user", isAuthenticated, userRoutes);
app.use("/api/workspace", isAuthenticated, workspaceRoutes);
app.use("/api/member", isAuthenticated, memberRoutes);
app.use("/api/project", isAuthenticated, projectRoutes);
app.use("/api/task", isAuthenticated, taskRoutes);

/* =======================
   6️⃣ ERROR HANDLER
   ======================= */
app.use(errorHandler);

/* =======================
   7️⃣ START SERVER (FIXED)
   ======================= */
(async () => {
  try {
    await connectDatabase();
    app.listen(config.PORT, () => {
      console.log(`✅ Server running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
})();

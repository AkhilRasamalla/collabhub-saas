import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";

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
   0️⃣ TRUST PROXY (RENDER)
   ======================= */
app.set("trust proxy", 1);

/* =======================
   1️⃣ CORS
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
   3️⃣ SESSION
   ======================= */
app.use(
  session({
    name: "collabhub.sid",
    secret: config.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
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
   5️⃣ SERVE FRONTEND
   ======================= */
const __dirname = path.resolve();

app.use(
  express.static(path.join(__dirname, "../client/dist"))
);

/* =======================
   6️⃣ API ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/user", isAuthenticated, userRoutes);
app.use("/api/workspace", isAuthenticated, workspaceRoutes);
app.use("/api/member", isAuthenticated, memberRoutes);
app.use("/api/project", isAuthenticated, projectRoutes);
app.use("/api/task", isAuthenticated, taskRoutes);

/* =======================
   7️⃣ SPA FALLBACK (CRITICAL)
   ======================= */
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client/dist/index.html")
  );
});

/* =======================
   8️⃣ ERROR HANDLER
   ======================= */
app.use(errorHandler);

/* =======================
   9️⃣ START SERVER
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

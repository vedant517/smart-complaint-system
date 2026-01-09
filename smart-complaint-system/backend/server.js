import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import complaintRoutes, { runEscalationCheck } from "./routes/complaintRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// simple request logger to capture incoming requests (helps debug route/404 issues)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Health endpoint to inspect DB connection state quickly
app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = mongoose.connection.readyState;
  res.json({ ok: true, mongoState: states[state] || state, readyState: state });
});

// 🔴 IMPORTANT: Disable mongoose buffering
// Keep mongoose buffering enabled so operations queue until connected.
// If you prefer to disable buffering, ensure the DB is connected before issuing operations.

const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/complaints";
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    console.log("✅ MongoDB connected to", MONGO_URI);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    app.use("/api/complaints", complaintRoutes);
    app.use("/api/officers", officerRoutes);
    app.use("/api/auth", authRoutes);

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("Express Error:", err.message);
      if (err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "Payload too large. Please reduce file size." });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    });

    app.listen(5000, () => {
      console.log(`🚀 Backend running on http://localhost:5000`);
      // schedule escalation check every 30 seconds (Simulator Mode)
      const intervalMs = process.env.ESCALATION_INTERVAL_MS ? parseInt(process.env.ESCALATION_INTERVAL_MS, 10) : 1000 * 30;
      console.log(`Scheduling escalation job every ${Math.round(intervalMs / 60000)} minutes`);
      // run initial check shortly after startup
      setTimeout(async () => {
        try {
          await runEscalationCheck();
        } catch (err) {
          console.error('Initial escalation run failed:', err.message);
        }
      }, 5 * 1000);

      setInterval(async () => {
        try {
          await runEscalationCheck();
        } catch (err) {
          console.error('Scheduled escalation run failed:', err.message);
        }
      }, intervalMs);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};

startServer();

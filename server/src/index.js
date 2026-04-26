import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import fileRoutes from "./routes/file.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const PORT = process.env.PORT || 6600;

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/files", fileRoutes);
    app.use("/api/users", userRoutes);

    app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok", service: "docshield-api" });
    });

    app.listen(PORT, () => {
      console.log(`DocShield API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start DocShield API:", error);
  }
};

startServer();

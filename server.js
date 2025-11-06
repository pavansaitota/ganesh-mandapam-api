import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import eventImageRoutes from "./routes/eventImageRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import joinRequestRoutes from "./routes/joinRequestRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (_req, res) => res.send("Ganesh Mandapam API running"));

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-images", eventImageRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/join-requests", joinRequestRoutes);

app.listen(PORT, () => console.log(`✅ API listening on ${PORT}`));

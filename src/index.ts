import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import transactionRoutes from "./routes/transactions";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: "http://192.168.157.22",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(bodyParser.json());

app.use("/api/transactions", transactionRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://192.168.157.22:${PORT}`);
});

import express from "express";
import cors from "cors";
import logger from "./lib/logger.js";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./modules/auth/routes.js";
import { menuRoutes, categoryRoutes } from "./modules/menu/routes.js";
import orderRoutes from "./modules/orders/routes.js";
import tableRoutes from "./modules/tables/routes.js";
import posRoutes from "./modules/pos/routes.js";
import reportRoutes from "./modules/reports/routes.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "Request");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "API server started");
});

import "dotenv/config";
import express from "express";
import bookingRoutes from "./routes/bookingRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import gatewayOnly from "./middlewares/gatewayOnly.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gatewayOnly);
app.use("/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Booking service running on port ${PORT}`);
});

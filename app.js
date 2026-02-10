import cors from "cors";
import express from "express";

// 🔹 Import routers
import paymentRouter from "./routers/payment.router.js";
import cartRouter from "./routers/cart.router.js";
import offerRouter from "./routers/offer.router.js";
import subscriptionRouter from "./routers/subscription.router.js";
import authRoutes from "./routers/authRoutes.js";
import orderRouter from "./routers/order.router.js";
import serviceRouter from "./routers/serviceRouter.js"; // ✅ Added
import addressRouter from "./routers/addressRouter.js";

// 🔹 Import EmailJS config routes
import configRoutes from "./routers/configRoutes.js"; // ✅ Added

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// ✅ Payment routes
app.use("/api", paymentRouter);

// ✅ Cart routes
app.use("/api/cart", cartRouter);

// ✅ Offers routes
app.use("/api/offers", offerRouter);

// ✅ Subscription routes (admin + user)
app.use("/api/subscriptions", subscriptionRouter);

// ✅ Orders routes
app.use("/api/orders", orderRouter);

// ✅ Services routes
app.use("/api/services", serviceRouter);

// ✅ Address routes
app.use("/api/address", addressRouter);

// ✅ EmailJS config routes (admin can get/update)
app.use("/api", configRoutes); // GET /api/config, POST /api/config

// ✅ Razorpay key route
app.get("/api/getkey", (req, res) => {
  res.status(200).json({
    keyId: process.env.KEY_ID,
  });
});

export default app;

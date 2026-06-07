import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { register, login } from "./app/controllers/authController.js";
import { getFoods, addFood } from "./app/controllers/foodController.js";
import { createOrder, getOrders, cancelOrder } from "./app/controllers/orderController.js";
import { getWishlist, updateWishlist, updateProfile } from "./app/controllers/userController.js";
import { listUsers, createUser, deleteUser, impersonateUser } from "./app/controllers/adminController.js";
import {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscription,
  getWeeklySelection,
  createSubscription,
  updateSubscription,
  cancelSubscription
} from "./app/controllers/subscriptionController.js";
import { isAdmin } from "./app/middlewares/adminMiddleware.js";
import { protect } from "./app/middlewares/authMiddleware.js";
import { validateRequest } from "./app/middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "./app/validation/authValidation.js";
import { foodSchema } from "./app/validation/foodValidation.js";
import { orderSchema } from "./app/validation/orderValidation.js";
import { wishlistSchema } from "./app/validation/wishlistValidation.js";
import { profileSchema } from "./app/validation/profileValidation.js";
import {
  subscriptionPlanSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema
} from "./app/validation/subscriptionValidation.js";
import { createUserSchema } from "./app/validation/adminValidation.js";
import { notFound, errorHandler } from "./app/middlewares/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth
app.post("/api/auth/register", validateRequest(registerSchema), register);
app.post("/api/auth/login", validateRequest(loginSchema), login);

// Foods
app.get("/api/foods", getFoods);
app.post("/api/foods", protect, validateRequest(foodSchema), addFood);

// Orders
app.post("/api/orders", protect, validateRequest(orderSchema), createOrder);
app.get("/api/orders", protect, getOrders);
app.delete("/api/orders/:id", protect, cancelOrder);

// Wishlist
app.get("/api/users/wishlist", protect, getWishlist);
app.put("/api/users/wishlist", protect, validateRequest(wishlistSchema), updateWishlist);

// Profile
app.put("/api/users/profile", protect, validateRequest(profileSchema), updateProfile);

// Subscription plans
app.get("/api/subscriptions/plans", listPlans);
app.post("/api/subscriptions/plans", protect, isAdmin, validateRequest(subscriptionPlanSchema), createPlan);
app.put("/api/subscriptions/plans/:id", protect, isAdmin, validateRequest(subscriptionPlanSchema), updatePlan);
app.delete("/api/subscriptions/plans/:id", protect, isAdmin, deletePlan);

// User subscriptions
app.get("/api/subscriptions", protect, getSubscription);
app.get("/api/subscriptions/weekly", protect, getWeeklySelection);
app.post("/api/subscriptions", protect, validateRequest(createSubscriptionSchema), createSubscription);
app.put("/api/subscriptions/:id", protect, validateRequest(updateSubscriptionSchema), updateSubscription);
app.delete("/api/subscriptions/:id", protect, cancelSubscription);

// Admin - user management
app.get("/api/admin/users", protect, isAdmin, listUsers);
app.post("/api/admin/users", protect, isAdmin, validateRequest(createUserSchema), createUser);
app.delete("/api/admin/users/:id", protect, isAdmin, deleteUser);
app.post("/api/admin/users/:id/impersonate", protect, isAdmin, impersonateUser);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

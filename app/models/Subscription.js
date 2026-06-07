import mongoose from "mongoose";

const selectedFoodSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  day: { type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], required: true },
  mealTime: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], default: "lunch" }
});

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  startDate: { type: Date, default: () => new Date() },
  nextBillingDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "paused", "cancelled"], default: "active" },
  selectedFoods: [selectedFoodSchema],
  notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);

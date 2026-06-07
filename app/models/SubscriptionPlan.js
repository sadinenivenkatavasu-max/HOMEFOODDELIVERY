import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  frequency: { type: String, enum: ["weekly", "monthly"], required: true },
  price: { type: Number, required: true, min: 0 },
  mealsIncluded: { type: Number, default: 0 },
  features: [{ type: String }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
      quantity: Number
    }
  ],
  totalPrice: Number,
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
});

export default mongoose.model("Order", orderSchema);

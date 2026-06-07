import Order from "../models/Order.js";

export const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create({ user: req.user._id, ...req.body });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.food");
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: id });
    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

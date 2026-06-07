import Subscription from "../models/Subscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Food from "../models/Food.js";

const calculateNextBillingDate = (startDate, frequency) => {
  const date = new Date(startDate);
  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
};

export const listPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ active: true }).sort("frequency price");
    res.json({ plans });
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Subscription plan not found" });
    res.json({ message: "Subscription plan deleted" });
  } catch (err) {
    next(err);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: { $ne: "cancelled" } })
      .sort({ updatedAt: -1 })
      .populate({ path: "plan", select: "title frequency price mealsIncluded description features" })
      .populate({ path: "selectedFoods.food", select: "name price description image category" });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json({ subscription });
  } catch (err) {
    next(err);
  }
};

export const getWeeklySelection = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: "active" })
      .sort({ updatedAt: -1 })
      .populate({ path: "plan", select: "title frequency price mealsIncluded description features" })
      .populate({ path: "selectedFoods.food", select: "name price image category" });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    const grouped = subscription.selectedFoods.reduce((acc, item) => {
      const day = item.day || "unscheduled";
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});

    res.json({ weeklySelection: grouped, plan: subscription.plan, status: subscription.status });
  } catch (err) {
    next(err);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const { planId, selectedFoods, notes } = req.body;
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    const selectedItems = [];
    for (const item of selectedFoods) {
      const food = await Food.findById(item.foodId);
      if (!food) {
        return res.status(404).json({ message: `Food item not found: ${item.foodId}` });
      }
      selectedItems.push({ food: food._id, day: item.day, mealTime: item.mealTime || "lunch" });
    }

    const now = new Date();
    const nextBillingDate = calculateNextBillingDate(now, plan.frequency);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: plan._id,
      startDate: now,
      nextBillingDate,
      selectedFoods: selectedItems,
      notes: notes || ""
    });

    await subscription.populate({ path: "plan", select: "title frequency price mealsIncluded description features" });
    await subscription.populate({ path: "selectedFoods.food", select: "name price description image category" });

    res.status(201).json({ subscription });
  } catch (err) {
    next(err);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { selectedFoods, status, notes } = req.body;
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (selectedFoods) {
      const selectedItems = [];
      for (const item of selectedFoods) {
        const food = await Food.findById(item.foodId);
        if (!food) {
          return res.status(404).json({ message: `Food item not found: ${item.foodId}` });
        }
        selectedItems.push({ food: food._id, day: item.day, mealTime: item.mealTime || "lunch" });
      }
      subscription.selectedFoods = selectedItems;
    }

    if (status) {
      subscription.status = status;
      if (status === "cancelled") {
        subscription.nextBillingDate = null;
      }
    }

    if (notes !== undefined) {
      subscription.notes = notes;
    }

    await subscription.save();
    await subscription.populate({ path: "plan", select: "title frequency price mealsIncluded description features" });
    await subscription.populate({ path: "selectedFoods.food", select: "name price description image category" });

    res.json({ subscription });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "cancelled";
    subscription.nextBillingDate = null;
    await subscription.save();

    res.json({ message: "Subscription cancelled successfully" });
  } catch (err) {
    next(err);
  }
};

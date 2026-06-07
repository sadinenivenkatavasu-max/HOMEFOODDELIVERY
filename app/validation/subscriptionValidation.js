import Joi from "joi";

export const subscriptionPlanSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  slug: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(""),
  frequency: Joi.string().valid("weekly", "monthly").required(),
  price: Joi.number().min(0).required(),
  mealsIncluded: Joi.number().integer().min(0).required(),
  features: Joi.array().items(Joi.string()).optional(),
  active: Joi.boolean().optional()
});

export const createSubscriptionSchema = Joi.object({
  planId: Joi.string().required(),
  selectedFoods: Joi.array().items(
    Joi.object({
      foodId: Joi.string().required(),
      day: Joi.string().valid("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday").required(),
      mealTime: Joi.string().valid("breakfast", "lunch", "dinner", "snack").optional()
    })
  ).required(),
  notes: Joi.string().allow("", null).optional()
});

export const updateSubscriptionSchema = Joi.object({
  selectedFoods: Joi.array().items(
    Joi.object({
      foodId: Joi.string().required(),
      day: Joi.string().valid("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday").required(),
      mealTime: Joi.string().valid("breakfast", "lunch", "dinner", "snack").optional()
    })
  ).optional(),
  status: Joi.string().valid("active", "paused", "cancelled").optional(),
  notes: Joi.string().allow("", null).optional()
});

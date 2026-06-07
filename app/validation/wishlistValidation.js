import Joi from "joi";

export const wishlistSchema = Joi.object({
  foodId: Joi.string().required(),
  action: Joi.string().valid("add", "remove").required(),
});

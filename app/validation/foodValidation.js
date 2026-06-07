import Joi from "joi";

export const foodSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  price: Joi.number().positive().required(),
  description: Joi.string().allow("", null),
  image: Joi.string().uri().allow("", null),
  category: Joi.string().allow("", null)
});

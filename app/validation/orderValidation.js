import Joi from "joi";

export const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        food: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),
  totalPrice: Joi.number().min(0).required(),
  status: Joi.string().valid("pending", "completed").optional()
});

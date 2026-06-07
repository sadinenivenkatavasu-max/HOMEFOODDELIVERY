export const validateRequest = (schema) => {
  return (req, res, next) => {
    // ensure req.body is an object to avoid destructuring errors
    const input = req.body ?? {};
    const { error, value } = schema.validate(input, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((detail) => detail.message)
      });
    }
    // replace body with validated/cleaned value
    req.body = value;
    next();
  };
};

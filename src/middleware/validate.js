const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError(
        result.error.issues.map((item) => item.message).join(", "),
        400
      )
    );
  }

  req.body = result.data;
  next();
};

module.exports = validate;

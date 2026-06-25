const Joi = require('joi');
const { AppError } = require('./errorMiddleware');

const validate = (schema) => {
  return async (ctx, next) => {
    const result = schema.validate(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      throw new AppError(
        `Validation failed: ${result.error.details.map(d => d.message).join(', ')}`,
        400
      );
    }

    ctx.request.body = result.value;
    await next();
  };
};

module.exports = { validate };
const Joi = require('joi');
const { AppError } = require('./errorMiddleware');

const validate = (schema) => {
  return async (ctx, next) => {
    try {
      const { body, query, params } = ctx;
      
      const combined = {
        ...body,
        ...query,
        ...params,
      };

      const result = schema.validate(combined, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (result.error) {
        const errors = result.error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        throw new AppError(
          `Validation failed: ${errors.map(e => e.message).join(', ')}`,
          400,
          true
        );
      }

      ctx.validatedData = result.value;
      await next();
    } catch (error) {
      throw error;
    }
  };
};

module.exports = { validate };
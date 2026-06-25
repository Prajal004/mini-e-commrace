const Router = require('koa-router');
const Joi = require('joi');

const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validationMiddleware');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

const router = new Router({
  prefix: '/api/v1/categories'
});

const categorySchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().allow('')
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(categorySchema),
  categoryController.create
);

router.get(
  '/',
  categoryController.list
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(categorySchema),
  categoryController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.delete
);

module.exports = router;
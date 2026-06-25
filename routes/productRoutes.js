const Router = require('koa-router');
const Joi = require('joi');

const productController = require('../controllers/productController');
const { validate } = require('../middlewares/validationMiddleware');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

const router = new Router({
  prefix: '/api/v1/products'
});

const createProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().allow(''),
  price: Joi.number().required().positive(),
  category_id: Joi.string().required(),
  stock_quantity: Joi.number().integer().min(0).default(0),
  options: Joi.array().optional().items({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }),
  images: Joi.array().optional().items(Joi.string().uri()),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().optional(),
  category_id: Joi.string().optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
  options: Joi.array().optional().items({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }),
  images: Joi.array().optional().items(Joi.string().uri()),
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  productController.create
);

router.get(
  '/',
  productController.list
);

router.get(
  '/:id',
  productController.getById
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.delete
);

module.exports = router;
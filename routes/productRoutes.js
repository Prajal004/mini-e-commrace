const Router = require('koa-router');
const productController = require('../controllers/productController');
const { validate } = require('../middlewares/validationMiddleware');
const { authenticate, verifyAuth, requireAdmin } = require('../middlewares/authMiddleware');
const Joi = require('joi');

const router = new Router();

const createSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional(),
  price: Joi.number().required().positive(),
  category_id: Joi.string().required(),
  options: Joi.array().optional().items({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }),
  images: Joi.array().optional().items(Joi.string().uri()),
});

const updateSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  category_id: Joi.string().optional(),
  options: Joi.array().optional().items({
    name: Joi.string().required(),
    value: Joi.string().required(),
  }),
  images: Joi.array().optional().items(Joi.string().uri()),
});

router.post('/', authenticate, verifyAuth, requireAdmin, validate(createSchema), productController.create);
router.put('/:id', authenticate, verifyAuth, requireAdmin, validate(updateSchema), productController.update);
router.delete('/:id', authenticate, verifyAuth, requireAdmin, productController.delete);
router.get('/:id', productController.getById);
router.get('/', productController.list);

module.exports = router;
const Router = require('koa-router');
const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validationMiddleware');
const { verifyAuth, requireAdmin } = require('../middlewares/authMiddleware');
const Joi = require('joi');

const router = new Router();

const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional(),
});

// Admin only routes
router.post('/', verifyAuth, requireAdmin, validate(createCategorySchema), categoryController.create);
router.put('/:id', verifyAuth, requireAdmin, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', verifyAuth, requireAdmin, categoryController.delete);

// Public route
router.get('/', categoryController.list);

module.exports = router;

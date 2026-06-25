const Router = require('koa-router');
const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validationMiddleware');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const Joi = require('joi');

const router = new Router();

const categorySchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().allow(''),
});

router.post('/', authenticate, requireAdmin, validate(categorySchema), categoryController.create);
router.put('/:id', authenticate, requireAdmin, validate(categorySchema), categoryController.update);
router.delete('/:id', authenticate, requireAdmin, categoryController.delete);

router.get('/', categoryController.list);

module.exports = router;
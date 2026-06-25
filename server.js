const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const logger = require('koa-logger');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = new Koa();

app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());
app.use(categoryRoutes.routes());
app.use(categoryRoutes.allowedMethods());
app.use(productRoutes.routes());
app.use(productRoutes.allowedMethods());

app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message: 'Endpoint not found',
  };
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
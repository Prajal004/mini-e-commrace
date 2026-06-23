const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = new Koa();

app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);

app.use(authRoutes.routes());
app.use(categoryRoutes.routes());
app.use(productRoutes.routes());

app.use((ctx) => {
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
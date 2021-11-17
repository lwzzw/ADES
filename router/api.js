const router = require('express').Router();
const gameRouter = require('./gameRouter');
const cartRouter = require('./cartRouter');
const categoryRouter = require('./categoryRouter');
const orderRouter = require('./orderRouter');
const userRouter = require('./userRouter');

router.use('/game', gameRouter);
router.use('/cart', cartRouter);
router.use('/category', categoryRouter);
router.use('/order', orderRouter);
router.use('/user', userRouter);

module.exports = router;
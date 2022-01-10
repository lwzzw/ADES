const router = require('express').Router();
const gameRouter = require('./gameRouter');
const cartRouter = require('./cartRouter');
const categoryRouter = require('./categoryRouter').default;
const orderRouter = require('./orderRouter');
const userRouter = require('./userRouter');
const twofaRouter = require('./twofaRouter');

router.use('/game', gameRouter);
router.use('/cart', cartRouter);
router.use('/category', categoryRouter);
router.use('/order', orderRouter);
router.use('/user', userRouter);
router.use('/twofa', twofaRouter);


module.exports = router;
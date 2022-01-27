const router = require('express').Router()
const gameRouter = require('./gameRouter').default
const cartRouter = require('./cartRouter')
const categoryRouter = require('./categoryRouter').default
const orderRouter = require('./orderRouter')
const userRouter = require('./userRouter')
const twofaRouter = require('./twofaRouter')
const keyRouter = require('./keyRouter')
const authenticate = require('./authenticate')
const admin = require('./adminPageRouter')

// router
router.use('/game', gameRouter)
router.use('/cart', cartRouter)
router.use('/category', categoryRouter)
router.use('/order', orderRouter)
router.use('/user', userRouter)
router.use('/twofa', twofaRouter)
router.use('/key', keyRouter)
router.use('/authenticate', authenticate)
router.use('/admin', admin)

module.exports = router

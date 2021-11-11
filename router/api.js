const router = require('express').Router();
const gameRouter = require('./gameRouter');

router.use('/game', gameRouter);

module.exports = router;
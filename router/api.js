const router = require('express').Router();
const gameRouter = require('./gameRouter');
const modulesRouter = require('./module');

router.use('/game', gameRouter);

module.exports = router;
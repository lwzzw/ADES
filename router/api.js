const router = require('express').Router();
const gameRouter = require('./gameRouter');
const modulesRouter = require('./module');

router.use('/game', gameRouter);
router.use('/api/modules', modulesRouter);

module.exports = router;
const nodeCache = require('node-cache')

// All Application Cache keys
const APP_CACHE = new nodeCache({
  deleteOnExpire: true,
  checkperiod: 60
})
const CACHE_KEYS = {
  DEALS: {
    ROWS: 'deals.rows'
  },
  BESTSELLERS: {
    GAMES: 'bestsellers.games'
  },
  PREORDERS: {
    GAMES: 'preorders.games'
  },
  LATESTRELEASES: {
    GAMES: 'latestreleases.games'
  },
  AUTOCOMPLETE: {
    GAMES: 'autocomplete.games'
  },
  USERS: {
    EMAILS: 'users.emails',
    FORGETPASS: 'users.forgetpass',
    ORDER: 'users.order'
  },
  CATEGORIES: {
    CAT: 'categories.cat'
  }
}
APP_CACHE.set('CACHE_KEYS', CACHE_KEYS)

module.exports = APP_CACHE

const nodeCache = require("node-cache");

// All Application Cache keys
const APP_CACHE = new nodeCache({
    deleteOnExpire: true
});
const CACHE_KEYS = {
    DEALS: {
        ROWS: "deals.rows",
    },
    BESTSELLERS: {
        GAMES: "bestsellers.games",
    },
    PREORDERS : {
        GAMES: "preorders.games"
    },
    LATESTRELEASES : {
        GAMES: "latestreleases.games"
    },
}
APP_CACHE.set("CACHE_KEYS", CACHE_KEYS)

module.exports = APP_CACHE
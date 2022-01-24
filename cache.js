const nodeCache = require("node-cache");

// All Application Cache keys
const APP_CACHE = new nodeCache({
    deleteOnExpire: true
});
const CACHE_KEYS = {
    DEALS: {
        ROWS: "deals.rows",
    }
}
APP_CACHE.set("CACHE_KEYS", CACHE_KEYS)

module.exports = APP_CACHE
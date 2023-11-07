var express = require('express');
var router = express.Router();
const cityController = require('../controllers/city');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/list/:countryCode/:stateCode', cityController.getCitybyStateCode);
} catch (e) {
    errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

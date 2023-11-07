var express = require('express');
var router = express.Router();
const stateController = require('../controllers/state');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/list/:countryCode', stateController.getStatebyCountryCode);
} catch (e) {
    errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

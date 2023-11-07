var express = require('express');
var router = express.Router();
const countryController = require('../controllers/country');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/list', countryController.getCountry);
} catch (e) {
    errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

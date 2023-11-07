var express = require('express');
var router = express.Router();
const termsController = require('../controllers/terms');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/list', termsController.getTerms);
} catch (e) {
    errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

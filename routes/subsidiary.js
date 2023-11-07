var express = require('express');
var router = express.Router();
const subsidiaryController = require('../controllers/subsidiary');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/list', subsidiaryController.getSubsidiary);
} catch (e) {
    errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

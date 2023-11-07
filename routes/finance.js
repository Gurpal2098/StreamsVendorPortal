var express = require('express');
var router = express.Router();
const { errorMsg } = require('../utility/globalMethod')
const financeController = require('../controllers/finance');
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
  router.post('/login', staticAuthorization, financeController.login);
} catch (e) {
  errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

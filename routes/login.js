var express = require('express');
var router = express.Router();
const { errorMsg } = require('../utility/globalMethod')
const loginController = require('../controllers/login');
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');
const path = require('path');


try {
  router.post('/sign-in', loginController.login);
} catch (e) {
  errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

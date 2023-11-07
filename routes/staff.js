var express = require('express');
var router = express.Router();
const staffController = require('../controllers/staff');
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.post('/login', staticAuthorization, staffController.login);
} catch (e) {
    errorMsg(e)
}

module.exports = router;

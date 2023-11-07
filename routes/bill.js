var express = require('express');
var router = express.Router();
const billController = require('../controllers/bill');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/details/:billId', billController.getBillDetails);
    router.post('/add', billController.addBill);
} catch (e) {
    errorMsg(e)
}

module.exports = router;

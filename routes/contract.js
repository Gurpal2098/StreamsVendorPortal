var express = require('express');
var router = express.Router();
const contractController = require('../controllers/contract');
const { errorMsg } = require('../utility/globalMethod')
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');

try {
    router.get('/details/:contractId', contractController.getContractDetails);
    router.post('/add', contractController.addContract)
} catch (e) {
    errorMsg(e)
}

module.exports = router;

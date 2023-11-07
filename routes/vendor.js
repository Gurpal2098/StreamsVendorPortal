var express = require('express');
var router = express.Router();
const { errorMsg } = require('../utility/globalMethod')
const vendorController = require('../controllers/vendor');
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');
const multer = require('multer');
const fs = require('fs');


// file upload 
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dynamicFolderPath = `assets/vendors/${req.body.vendorId}`;

//     if (!fs.existsSync(dynamicFolderPath)) {
//       fs.mkdirSync(dynamicFolderPath, { recursive: true });
//     }
//     cb(null, dynamicFolderPath);
//   },
//   filename: function (req, file, cb) {
//     const unique = Date.now();
//     cb(null, unique + '-' + file.originalname);
//   },
// })

// const filesupload = multer({
//   storage: storage
// });



try {
  router.post('/login', staticAuthorization, vendorController.login)
  router.get('/dropdown', dynamicAuthorization, vendorController.getVendorDropdown)
  router.get('/terms-subsidiary/:vendorId', dynamicAuthorization, vendorController.getTermsSubsidiarybyVendorId);
  router.get('/items/:vendorId', dynamicAuthorization, vendorController.getVendorItemsbyVendorId);
  router.get('/list', vendorController.getVendorList);
  router.post('/add', vendorController.addVendor);
  router.post('/finance-info', vendorController.updateFinanceInfo);
  router.get('/details/:vendorId', vendorController.getVendorDetails);
} catch (e) {
  errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

var express = require('express');
var router = express.Router();
const { errorMsg } = require('../utility/globalMethod')
const indexController = require('../controllers/index');
const { staticAuthorization, dynamicAuthorization } = require('../middleware/authorization');
const multer = require('multer');
const path = require('path');

// file upload 
// const storage = multer.diskStorage({
//   destination: 'public',
//   filename: (req, file, cb) => {
//     return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//   }
// })

// const filesupload = multer({
//   storage: storage
// });

try {
  router.get('/', indexController.indexMethod);
} catch (e) {
  errorMsg(e)
}

/* END OF ADMIN ROUTING */

module.exports = router;

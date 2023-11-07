const utility = require('../utility/globalMethod');
 
exports.staticAuthorization= (req, res, next) => {
    try {
        let checkHeader = req.get('Authorization');
 
        if (checkHeader == 'undefined' || checkHeader == undefined) {
            return res.status(400).send({ success: false, message: `Bad Request` });
        }
 
        if (checkHeader == '' || checkHeader == null || checkHeader == undefined) {
            return res.status(401).send({ success: false, message: `Invalid Authorization` });
        }
 
        if (!(checkHeader == process.env.STATIC_API_TOKEN)) {
            return res.status(401).send({ success: false, message: `Invalid token` });
        }
    } catch (exception) {
        return res.status(500).send({ success: false, message: `Something went to wrong please try again` });
    }
    next();
}
 
exports.dynamicAuthorization = (req, res, next) => {
    try {
        let checkHeader = req.get('Authorization');
        if (checkHeader == 'undefined' || checkHeader == undefined) {
            return res.status(400).send({ success: false, message: `Bad Request` });
        }
        if (checkHeader == '' || checkHeader == null || checkHeader == undefined) {
            return res.status(401).send({ success: false, message: `Invalid Authorization` });
        }
        if (!utility.validateToken(checkHeader)) {
            return res.status(401).send({ success: false, message: `Invalid token` });
        }
    } catch (exception) {
        return res.status(500).send({ success: false, message: `Something went to wrong please try again` });
    }
    next();
}
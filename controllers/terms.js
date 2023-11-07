const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
const multer = require('multer');


module.exports = {

    getTerms: async (req, res) => {

        try {

            const getAllTerms = {
                text: `
                        Select 
                            "id",
                            "Term" 
                        from 
                            "Terms" 
                        where 
                            "Terms"."IsActive" = true
                    `
            }

            const [err, getTerms] = await Model.getList(getAllTerms)

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, record_count: getTerms.length, message: (getTerms.length > 0) ? `Terms list` : `Terms List Not Found`, terms_list: getTerms });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }

}
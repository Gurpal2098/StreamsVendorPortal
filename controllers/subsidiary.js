const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
const multer = require('multer');


module.exports = {

    getSubsidiary: async (req, res) => {

        try {

            const getAllSubsidiary = {
                text: `
                        Select 
                            "Id",
                            "Name" 
                        from 
                            "Subsidiary" 
                        where 
                            "Subsidiary"."IsActive" = true
                    `
            }

            const [err, getSubsidiary] = await Model.getList(getAllSubsidiary)

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, record_count: getSubsidiary.length, message: (getSubsidiary.length > 0) ? `Subsidiary list` : `Subsidiary List Not Found`, subsidiary_list: getSubsidiary });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }

}
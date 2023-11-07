const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const tables = require('../models/commanTable');

module.exports = {

    indexMethod: async (req, res) => {
        try {
            return res.status(200).send(`<h1>Welcome to our home !<h1>`); 
        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }

    },

}
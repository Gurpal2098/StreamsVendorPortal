const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
var Country = require('country-state-city').Country;

module.exports = {

    getCountry: async (req, res) => {

        try {
            return res.status(200).send({ success: true, record_count: Country.getAllCountries().length, message: (Country.getAllCountries().length > 0) ? `Country list` : `Country List Not Found`, country_list: Country.getAllCountries() });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }

}
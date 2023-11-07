const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
var City = require('country-state-city').City;

module.exports = {

    getCitybyStateCode: async (req, res) => {

        try {
            const { countryCode, stateCode } = req.params

            if (!isNaN(countryCode)) {
                return res.status(200).send({ success: false, message: `Please enter valid country code` });
            }

            if (!isNaN(stateCode)) {
                return res.status(200).send({ success: false, message: `Please enter valid state code` });
            }

            return res.status(200).send({ success: true, record_count: City.getCitiesOfState(countryCode, stateCode).length, message: (City.getCitiesOfState(countryCode, stateCode).length > 0) ? `City list` : `City List Not Found`, city_list: City.getCitiesOfState(countryCode, stateCode) });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }

}
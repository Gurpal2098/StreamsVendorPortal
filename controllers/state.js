const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
var State = require('country-state-city').State;

module.exports = {

    getStatebyCountryCode: async (req, res) => {

        try {
            const { countryCode } = req.params

            if (!isNaN(countryCode)) {
                return res.status(200).send({ success: false, message: `Please enter valid country code` });
            }

            return res.status(200).send({ success: true, record_count: State.getStatesOfCountry(countryCode).length, message: (State.getStatesOfCountry(countryCode).length > 0) ? `State list` : `State List Not Found`, state_list: State.getStatesOfCountry(countryCode) });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }

}
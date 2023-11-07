const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');

module.exports = {

    login: async (req, res) => {

        let { email, password } = req.body;

        if (!email) {
            return res.status(200).send({ success: false, message: `Please enter email` });
        }

        if (!Validators.emailValidator(email)) {
            return res.status(200).send({ success: false, message: `Please enter valid email ID` });
        }

        if (!password) {
            return res.status(200).send({ success: false, message: `Please enter password` });
        }

        if (password.toString().length < 5) {
            return res.status(200).send({ success: false, message: `Password have atleast 5 characters` });
        }

        if (password.toString().length > 50) {
            return res.status(200).send({ success: false, message: `Password must have 50 characters only` });
        }

        const getFinanceDetailQuery = {
            text: `Select * FROM "FinanceDetailView" where "IsActive" = $1 AND "Email" = $2`,
            values: [CONSTANT_VARIABLES.ISACTIVESTATUS, email.toLowerCase().trim()]
        }

        const [err, getFinanceDetail] = await Model.getRow(getFinanceDetailQuery);

        if (err) {
            return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
        }

        if (!!getFinanceDetail) {

            if (password == getFinanceDetail.Password) {

                const getRoleQuery = {
                    text: `Select "id", "RoleName" from "Role" where "Role"."id" = $1`,
                    values: [getFinanceDetail.RoleId]
                }

                // const getTransactionQuery = {
                //     text: `Select * from "Transactions"`
                // }

                const [errRole, getRole] = await Model.getRow(getRoleQuery);
                // const [errTransaction, getTransaction] = await Model.getList(getTransactionQuery);

                // if (errRole || errTransaction) {
                //     return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
                // }

                delete getFinanceDetail.Password;
                delete getFinanceDetail.CreatedAt;
                delete getFinanceDetail.ModifiedAt;

                let accessToken = GLOBAL_METHOD.generateToken(getFinanceDetail.id);

                if (!accessToken) {
                    return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
                }

                return res.status(200).send({ success: true, message: `Login Successfully`, access_token: accessToken, login_detail: getFinanceDetail, role: "Finance", roles: getRole });


            } else {
                return res.status(200).send({ success: false, message: `Invalid Credentials` });
            }

        } else {
            return res.status(200).send({ success: false, message: `Invalid Credentials` });
        }

    }

}
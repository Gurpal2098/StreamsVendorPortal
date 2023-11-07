const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const tables = require('../models/commanTable');

module.exports = {

    login: async (req, res) => {
        try {

            const { email, mobile } = req.body;

            if(!email) {
                return res.status(200).send({ success: false, message: `Please enter email` });
            }

            if (!Validators.emailValidator(email)) {
                return res.status(200).send({ success: false, message: `Please enter valid email ID` });
            }

            // const getAllVendor = {
            //     text: `
            //             Select 
            //                 v."id", 
            //                 v."VendorId", 
            //                 v."LegalName", 
            //                 v."TermId", 
            //                 v."EmailId", 
            //                 v."Status", 
            //                 venAdd."Country", 
            //                 venAdd."State", 
            //                 venAdd."City", 
            //                 t."Term", 
            //                 s."Name" 
            //             FROM 
            //                 "Vendors" v 
            //                 JOIN "VendorAddresses" venAdd ON v."VendorId" = venAdd."VendorId" 
            //                 JOIN "Terms" t ON v."TermId" = t."id" 
            //                 JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id" 
            //             where 
            //                 v."IsActive" = $1
            //           `,
            //         values: [ CONSTANT_VARIABLES.ISACTIVESTATUS ]
            // }

            // const [err, getVendorList] = await Model.getList(getAllVendor);
            
            // if (err) {
            //     return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            // }

            // return res.status(200).send({ success: true, record_count: getVendorList.length, message: (getVendorList.length > 0) ? `Vendor list` : `Vendor List Not Found`, vendor_list: getVendorList });
 
        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },


}
const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
const multer = require('multer');


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

        const getVendorDetailQuery = {
            text: `Select * FROM "VendorDetailView" where "IsActive" = $1 AND "Email" = $2`,
            values: [CONSTANT_VARIABLES.ISACTIVESTATUS, email.toLowerCase()]
        }

        const [err, getVendorDetail] = await Model.getRow(getVendorDetailQuery);

        if (err) {
            return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
        }

        if (!!getVendorDetail) {

            if (password == getVendorDetail.Password) {

                const getRoleQuery = {
                    text: `Select "id", "RoleName" from "Role" where "Role"."id" = $1`,
                    values: [getVendorDetail.RoleId]
                }

                // const getTransactionQuery = {
                //     text: `Select * from "Transactions"`
                // }

                const [errRole, getRole] = await Model.getRow(getRoleQuery);
                // const [errTransaction, getTransaction] = await Model.getList(getTransactionQuery);

                // if (errRole || errTransaction) {
                //     return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
                // }

                delete getVendorDetail.Password;
                delete getVendorDetail.CreatedAt;
                delete getVendorDetail.ModifiedAt;

                let accessToken = GLOBAL_METHOD.generateToken(getVendorDetail.id);

                if (!accessToken) {
                    return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
                }

                return res.status(200).send({ success: true, message: `Login Successfully`, access_token: accessToken, login_detail: getVendorDetail, role: "Vendor", roles: getRole });

            } else {
                return res.status(200).send({ success: false, message: `Invalid Credentials` });
            }

        } else {
            return res.status(200).send({ success: false, message: `Invalid Credentials` });
        }

    },

    getVendorDropdown: async (req, res) => {

        try {

            const getAllVendor = {
                text: `
                        Select 
                            "id",
                            "LegalName",
                            "VendorId" 
                        from 
                            "Vendors" 
                        where 
                            "Vendors"."IsActive" = true
                      `
            }

            const [err, getVendorDropdown] = await Model.getList(getAllVendor);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, record_count: getVendorDropdown.length, message: (getVendorDropdown.length > 0) ? `Vendor list` : `Vendor List Not Found`, vendor_dropdown: getVendorDropdown });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }

    },

    getTermsSubsidiarybyVendorId: async (req, res) => {

        try {

            const getTermsSubsidiary = {
                text: `
                        Select
                        v."VendorId", 
                        t."Term", 
                        s."Name"
                        FROM 
                            "Vendors" v 
                            JOIN "Terms" t ON v."TermId" = t."id"
                            JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
                        where 
                            v."id" = $1
                    `,
                values: [req.params.vendorId]
            }

            const [err, getData] = await Model.getRow(getTermsSubsidiary);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, terms_subsidiary: getData });


        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },

    getVendorItemsbyVendorId: async (req, res) => {

        try {

            const getVendorItems = {
                text: `
                        Select
                        it."vendorId", 
                        it."itemId", 
                        it."description", 
                        i."Name" AS ItemName
                        FROM 
                            "Item-Vendor" it
                            JOIN "Items" i ON it."itemId" = i."id"
                        where 
                        it."vendorId" = $1
                    `,
                values: [req.params.vendorId]
            }

            const [err, getItemsList] = await Model.getList(getVendorItems);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, item_count: getItemsList.length, itemsList: getItemsList });


        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },

    getVendorList: async (req, res) => {
        try {

            const getAllVendor = {
                text: `
                        Select 
                            v."id", 
                            v."VendorId", 
                            v."LegalName", 
                            v."TermId", 
                            v."EmailId", 
                            v."Status", 
                            venAdd."Country", 
                            venAdd."State", 
                            venAdd."City", 
                            t."Term", 
                            s."Name" 
                        FROM 
                            "Vendors" v 
                            JOIN "VendorAddresses" venAdd ON v."id" = venAdd."VendorId" 
                            JOIN "Terms" t ON v."TermId" = t."id" 
                            JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id" 
                        where 
                            v."IsActive" = $1
                      `,
                values: [CONSTANT_VARIABLES.ISACTIVESTATUS]
            }

            const [err, getVendorList] = await Model.getList(getAllVendor);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            return res.status(200).send({ success: true, record_count: getVendorList.length, message: (getVendorList.length > 0) ? `Vendor list` : `Vendor List Not Found`, vendor_list: getVendorList });

        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },

    addVendor: async (req, res) => {

        try {

            const { vendor, subsidiary, terms, addressLine1, addressLine2, pincode, country, state, city, primary_email, contact_information } = req.body;

            if (!vendor) {
                return res.status(200).send({ success: false, message: `Please enter vendor name` });
            }
            if (!/^[a-zA-Z\s]+$/.test(vendor.trim())) {
                return res.status(200).send({ success: false, message: `Please enter valid vendor name` });
            }
            if (!subsidiary) {
                return res.status(200).send({ success: false, message: `Please select subsidiary` });
            }
            if (isNaN(subsidiary)) {
                return res.status(200).send({ success: false, message: `Invalid subsidiary ID` });
            }
            if (!terms) {
                return res.status(200).send({ success: false, message: `Please select terms` });
            }
            if (isNaN(terms)) {
                return res.status(200).send({ success: false, message: `Invalid terms ID` });
            }
            if (!addressLine1) {
                return res.status(200).send({ success: false, message: `Please enter addressLine 1` });
            }
            if (!pincode) {
                return res.status(200).send({ success: false, message: `Please enter pincode` });
            }
            if (isNaN(pincode)) {
                return res.status(200).send({ success: false, message: `Invalid pincode` });
            }
            if (pincode.toString().length > 10) {
                return res.status(200).send({ success: false, message: `Pincode is too large` });
            }
            if (!country) {
                return res.status(200).send({ success: false, message: `Please select country` });
            }
            if (!state) {
                return res.status(200).send({ success: false, message: `Please select state` });
            }
            if (!city) {
                return res.status(200).send({ success: false, message: `Please select city` });
            }
            if (!primary_email) {
                return res.status(200).send({ success: false, message: `Please enter email ID` });
            }
            if (!Validators.emailValidator(primary_email)) {
                return res.status(200).send({ success: false, message: `Please enter valid email ID` });
            }
            if (!contact_information) {
                return res.status(200).send({ success: false, message: `Please enter contact information` });
            }
            if (contact_information.length > 3) {
                return res.status(200).send({ success: false, message: `Only 3 contact information is allowed` });
            }

            let contactInfo_array = contact_information, newContactInfo_array = [];

            if (GLOBAL_METHOD.validateEmailsInArray(contactInfo_array).length > 0) {
                return res.status(200).send({ success: false, message: `You have entered invalid email ID. Kindly check`, invalid_email: GLOBAL_METHOD.validateEmailsInArray(contactInfo_array) });
            }

            const vendorAdd = {
                text: `INSERT INTO "Vendors" ("LegalName", "SubsidiaryId", "TermId", "EmailId", "Status") VALUES($1,$2,$3,$4,$5) RETURNING *`,
                values: [vendor, subsidiary, terms, primary_email, CONSTANT_VARIABLES.ACCEPTACTION],
            }

            const vendorAddress = {
                text: `INSERT INTO "VendorAddresses" ("AddressLine1","AddressLine2","City","State","Country","PostalCode","VendorId") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                values: [addressLine1, addressLine2, city, state, country, pincode]
            }

            for (let i = 0; i < contactInfo_array.length; i++) {
                newContactInfo_array.push([contactInfo_array[i].firstName, contactInfo_array[i].lastName, contactInfo_array[i].email, contactInfo_array[i].phoneNo, contactInfo_array[i].checked]);
            }

            const vendorContacts = {
                text: `INSERT INTO "VendorContacts"("FirstName", "LastName", "Email", "Phone", "IsPrimary", "VendorId") VALUES %L returning *`,
                values: newContactInfo_array
            }

            const [err, vendorData] = await Model.beginTransaction(vendorAdd, vendorAddress, vendorContacts);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (vendorData) {
                return res.status(200).send({ success: true, message: `Vendor successfully added` });
            }

        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong`, error: exception.message });
        }

    },

    updateFinanceInfo: async (req, res) => {
        try {

            const { vendorId, bankName, branchName, branchAddress, accountNo, IFSC_Code, tanNo } = req.body;
            // const file = req.file
            // console.log("hii", file)

            if (!vendorId) {
                return res.status(200).send({ success: false, message: `Please enter Vendor Id` });
            }
            if (isNaN(vendorId)) {
                return res.status(200).send({ success: false, message: `Invalid Vendor Id` });
            }
            if (!bankName) {
                return res.status(200).send({ success: false, message: `Please enter Bank name` });
            }
            if (!branchName) {
                return res.status(200).send({ success: false, message: `Please enter Branch name` });
            }
            if (!branchAddress) {
                return res.status(200).send({ success: false, message: `Please enter Branch Address` });
            }
            if (!accountNo) {
                return res.status(200).send({ success: false, message: `Please enter Account No` });
            }
            if (isNaN(accountNo)) {
                return res.status(200).send({ success: false, message: `Invalid Account No` });
            }
            if (!IFSC_Code) {
                return res.status(200).send({ success: false, message: `Please enter IFSC code` });
            }
            if (!tanNo) {
                return res.status(200).send({ success: false, message: `Please enter TAN No` });
            }

            const vendorFinanceInfo = {
                text: `UPDATE "Vendors" SET "BankName" = $1, "BranchName" = $2, "BranchAddress" = $3, "AccountNumber" = $4, "IFSCCode" = $5,"TANNumber" = $6 WHERE id = $7 returning *`,
                values: [bankName, branchName, branchAddress, accountNo, IFSC_Code, tanNo, vendorId],
            }

            // let updatedData = {
            //     '"BankName"': bankName,
            //     '"BranchName"': branchName,
            //     '"BranchAddress"': branchAddress,
            //     '"AccountNumber"': accountNo,
            //     '"IFSCCode"': IFSC_Code,
            //     '"TANNumber"': tanNo
            // }

            // let condition = {
            //     '"id"': vendorId,
            // }

            // const [err, vendorData] = await Model.updateObject('"Vendors"', updatedData, condition);
            const [err, vendorData] = await Model.updateData(vendorFinanceInfo);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }
            if (vendorData)
                // console.log(vendorData);
                return res.status(200).send({ success: true, message: `Vendor Finance Info added successfully` });
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }

    },

    getVendorDetails: async (req, res) => {
        try {
            const { vendorId } = req.params

            if (isNaN(vendorId)) {
                return res.status(200).send({ success: false, message: `Please enter valid vendor Id` });
            }

            const getDetails = {
                text: `
                        Select 
                        v."LegalName",
                        v."VendorId",
                        v."TermId",
                        v."SubsidiaryId",
                        v."Status",
                        v."EmailId",
                        v."BankName",
                        v."BranchName",
                        v."BranchAddress",
                        v."AccountNumber",
                        v."IFSCCode",
                        v."TANNumber",
                        t."Term", 
                        s."Name",
                        st."Name" AS "StatusName",
                        venAdd."AddressLine1",
                        venAdd."AddressLine2",
                        venAdd."City",
                        venAdd."State",
                        venAdd."Country",
                        venAdd."PostalCode",
                        (
                            SELECT json_agg(json_build_object(
                              'FirstName', venCont."FirstName",
                              'LastName', venCont."LastName",
                              'Email', venCont."Email",
                              'Phone', venCont."Phone",
                              'IsPrimary', venCont."IsPrimary"
                            ))
                            FROM "VendorContacts" venCont
                            WHERE venCont."VendorId" = v."id"
                          ) AS "ContactInfo"
                        FROM 
                            "Vendors" v 
                            JOIN "Terms" t ON v."TermId" = t."id"
                            JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
                            JOIN "Status" st ON v."Status" = st."id"
                            JOIN "VendorAddresses" venAdd ON v."id" = venAdd."VendorId"
                        where 
                            v."id" = $1
                      `,
                values: [vendorId]
            }

            const [err, getVendorDetails] = await Model.getRow(getDetails);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (!!getVendorDetails) {
                return res.status(200).send({ success: true, message: 'Vendor details found', vendor_details: getVendorDetails });
            }
            else {
                return res.status(200).send({ success: true, message: 'Vendor details not found' });
            }

        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    }
}
const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');
const multer = require('multer');


module.exports = {

    getContractDetails: async (req, res) => {
        try {
            const { contractId } = req.params;
           
            if (isNaN(contractId)) {
                return res.status(200).send({ success: false, message: `Please enter valid contract Id` });
            }

            const getDetails = {
                text: `
                        Select
                        c."id", 
                        c."StartDate",
                        c."RejectionReason", 
                        c."CreatedAt", 
                        c."Status" AS "StatusId", 
                        st."Name" AS "StatusName", 
                        c."EndDate", 
                        c."DocumentNo", 
                        c."ContractTotal", 
                        v."id" AS "VendorId", 
                        v."LegalName", 
                        t."Term", 
                        s."Name",
                        (
                            SELECT json_agg(json_build_object(
                              'id', cl."id",
                              'ItemId', cl."ItemId",
                              'ItemName', it."Name",
                              'Quantity', cl."Quantity",
                              'Amount', cl."Amount",
                              'Rate', cl."Rate"
                            ))
                            FROM "ContractLines" cl
                            JOIN "Items" it ON cl."ItemId" = it."id"
                            WHERE cl."ContractId" = c."id"
                        ) AS "LineItems",
                        (
                            SELECT json_agg(json_build_object(
                              'FileId', "id", 
                              'FileName', "Name",
                              'Path', "Path"
                            ))
                            FROM "ContractDocuments"
                            WHERE "ContractId" = c."id"
                        ) AS "Files"
                        
                        FROM 
                            "Contracts" c
                            JOIN "Vendors" v ON c."VendorId" = v."VendorId"
                            JOIN "Terms" t ON v."TermId" = t."id"
                            JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
                            JOIN "Status" st ON c."Status" = st."id"
                            
                        where 
                            c."id" = $1
                      `,
                values: [contractId]
            }

            const [err, getContractDetails] = await Model.getRow(getDetails);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (!!getContractDetails) {
                return res.status(200).send({ success: true, message: 'Contract details found', contract_details: getContractDetails });
            }
            else {
                return res.status(200).send({ success: true, message: 'Contract details not found' });
            }

        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },

    addContract: async (req, res) => {

        try {

            const { startDate, endDate, vendorId, transactionId, roleId, lineItems, totalAmount, filesPath } = req.body;

            if (!startDate) {
                return res.status(200).send({ success: false, message: `Please enter start date` });
            }
            if (!Validators.dateValidator(startDate)) {
                return res.status(200).send({ success: false, message: `Invalid start date` });
            }
            if (!Validators.dateValidator(endDate)) {
                return res.status(200).send({ success: false, message: `Invalid end date` });
            }
            if (!endDate) {
                return res.status(200).send({ success: false, message: `Please enter end date` });
            }
            if (!vendorId) {
                return res.status(200).send({ success: false, message: `Please enter vendor Id` });
            }
            if (isNaN(vendorId)) {
                return res.status(200).send({ success: false, message: `Invalid vendor Id` });
            }
            if (!transactionId) {
                return res.status(200).send({ success: false, message: `Please enter transaction Id` });
            }
            if (isNaN(transactionId)) {
                return res.status(200).send({ success: false, message: `Invalid transaction Id` });
            }
            if (!roleId) {
                return res.status(200).send({ success: false, message: `Please enter role Id` });
            }
            if (isNaN(roleId)) {
                return res.status(200).send({ success: false, message: `Invalid role Id` });
            }
            if (!lineItems) {
                return res.status(200).send({ success: false, message: `Please provide line items` });
            }
            if (lineItems.length <= 0) {
                return res.status(200).send({ success: false, message: `Atleast one line item is required` });
            }
            if (!filesPath) {
                return res.status(200).send({ success: false, message: `Please provide files` });
            }
            if (!totalAmount) {
                return res.status(200).send({ success: false, message: `Please enter total amount` });
            }
            if (isNaN(totalAmount)) {
                return res.status(200).send({ success: false, message: `Invalid total amount` });
            }
            if (filesPath.length <= 0) {
                return res.status(200).send({ success: false, message: `Atleast one file is required` });
            }
            if (filesPath.length > 5) {
                return res.status(200).send({ success: false, message: `Only 5 files are allowed` });
            }

            let lineItemsArray = lineItems, newLineItemsArray = [];

            if (!GLOBAL_METHOD.validateLineItemsInArray(lineItemsArray)) {
                return res.status(200).send({ success: false, message: `Invalid line item.` });
            }
            
            const getVendorDetail = {
                text: `
                        Select "VendorId" FROM  "Vendors" where "id" = $1
                      `,
                values: [vendorId]
            }

            const [err, getVendorId] = await Model.getRow(getVendorDetail);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (!getVendorId) {
                return res.status(200).send({ success: false, message: `Vendor Id does not exits` });
            }

            let vendor_Id = getVendorId.VendorId;

            const getContractApprovalDetails = {
                text: `
                        SELECT "status" , "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2
                      `,
                values: [transactionId, roleId]
            }

            const [errContract, getContractApproval] = await Model.getRow(getContractApprovalDetails);

            if (errContract) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (!!getContractApproval) {
                console.log(getContractApproval); return

            } else {

                const getAllLevels = {
                    text: `
                            SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "level" = $2
                          `,
                    values: [transactionId, 0]
                }

                const [errLevel, getLevels] = await Model.getRow(getAllLevels);

                if (errLevel) {
                    return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
                }

                if (!!getLevels) {
                    const status = getLevels.status;
                    console.log(getLevels, status);

                    const contractAdd = {
                        text: `INSERT INTO "Contracts" ("StartDate","EndDate","VendorId","ContractTotal","Status") VALUES($1,$2,$3,$4,$5) RETURNING *`,
                        values: [startDate, endDate, vendor_Id, totalAmount, status],
                    }

                    // for (let i = 0; i < contactInfo_array.length; i++) {
                    //     newContactInfo_array.push([contactInfo_array[i].firstName, contactInfo_array[i].lastName, contactInfo_array[i].email, contactInfo_array[i].phoneNo, contactInfo_array[i].checked]);
                    // }


                } else {
                    return res.status(200).send({ success: false, message: `Approval level not found` });
                }








            }







        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong`, error: exception.message });
        }
    }
}
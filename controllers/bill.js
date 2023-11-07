const Validators = require('../utility/validations');
const fs = require('fs')
const GLOBAL_METHOD = require('../utility/globalMethod');
const CONSTANT_VARIABLES = require('../utility/constVariables');
const Model = require('../models/commanTable');
var format = require('pg-format');



module.exports = {

    getBillDetails: async (req, res) => {
        try {
            const { billId } = req.params;
           
            if (isNaN(billId)) {
                return res.status(200).send({ success: false, message: `Please enter valid Bill Id` });
            }

            const getDetails = {
                text: `SELECT 
                v."id" AS "VendorId",
                v."LegalName",
                t."Term",
                c."DocumentNo",
                c."id" AS "ContractId",
				c."StartDate",
                c."EndDate",
				c."ContractTotal",
                inv."id",
                inv."DocumentNo" AS "InvDocumentNo",
                inv."RejectionReason",
                inv."ReferenceNo",
                inv."IndividualBill",
                inv."BillDate",
                inv."DueDate",
                inv."Status" AS "StatusId", 
                st."Name" AS "StatusName",
                inv."LineGST",
                inv."CGST",
                inv."SGST",
                inv."IGST",
                inv."UTGST",
				inv."InvoiceTotal",
                inv."TaxSubtotal",
                inv."Total",
                py."PaymentId",
                pt."PaymentTransactionId", 
                py."TDSAmount",
                (
                    SELECT 
                        json_agg(
                            json_build_object(
                                'ItemId', invl."ItemId",
                                'InvoiceLineId', invl."id",
                                'ContractLineId',invl."ContractLineId",
                                'ItemName', it."Name",
                                'Rate', invl."Rate",                                
                                'Quantity', COALESCE(invl."Quantity", 0),
                                'CGST',invl."CGST",
                                'SGST',invl."SGST", 
                                'IGST',invl."IGST",
                                'UTGST',invl."UTGST",
                                'GST_Total', invl."GST_Total",
                                'Amount', invl."Amount",
                                'invoiceQuantityTotal', COALESCE(ail."TotalQuantity", 0) - COALESCE(invl."Quantity", 0),
                                'remainingQuantity', (cl."Quantity" + COALESCE(invl."Quantity", 0)) - COALESCE(ail."TotalQuantity", 0)
                            )
                        )
                    FROM 
                        "InvoiceLines" invl
                    INNER JOIN 
                        "Items" it ON invl."ItemId" = it."id"
                    INNER JOIN 
                        "ContractLines" cl ON inv."ContractId" = cl."ContractId"
                    LEFT JOIN (
                        SELECT
                        invl."id",
                            invl."ItemId", 
                            invl."ContractLineId",
                            SUM(invl."Quantity") AS "TotalQuantity" 
                            
                        FROM 
                            "InvoiceLines" invl
                        WHERE 
                            invl."InvoiceId" IN (SELECT "id" FROM "Invoices" WHERE "ContractId" = c."id")
                        GROUP BY 
                            invl."ContractLineId",
                            invl."ItemId",
                            invl."id" 
                    ) ail ON cl."ItemId" = ail."ItemId" AND cl."id" = ail."ContractLineId"
                    WHERE 
                        invl."InvoiceId" = inv."id" 
                        AND invl."ItemId" = ail."ItemId" 
                        AND invl."id" = ail."id"
                        AND cl."id" = ail."ContractLineId" 
                ) AS "LineItems",
                (
                    SELECT 
                        json_agg(
                            json_build_object(
                                'FileId', "id", 
                                'FileName', "Name",
                                'Path', "Path"
                            )
                        )
                    FROM 
                        "InvoiceDocuments"
                    WHERE 
                        "InvoiceId" = inv."id"
                ) AS "Files",
                COALESCE((
                    SELECT 
                        SUM(inv2."InvoiceTotal")
                    FROM 
                        "Invoices" inv2
                    WHERE 
                        inv2."ContractId" = c."id" 
                        AND inv2."id" != inv."id"
                ), 0) AS "TotalInvoicedAmountForContract",
                (c."ContractTotal" - COALESCE((
                    SELECT 
                        SUM(inv2."InvoiceTotal")
                    FROM 
                        "Invoices" inv2
                    WHERE 
                        inv2."ContractId" = c."id" 
                        AND inv2."id" != inv."id"
                ), 0)) AS "PendingBill",
                (py."Total" - COALESCE(total_amount_paid."TotalAmountPaid", 0)) AS "RemainingAmount"
            FROM 
                "Invoices" inv
            INNER JOIN 
                "Vendors" v ON inv."VendorId" = v."id"
            INNER JOIN 
                "Contracts" c ON inv."ContractId" = c."id"
            INNER JOIN 
                "Status" st ON inv."Status" = st."id"
            LEFT JOIN 
                "Payment" py ON inv."id" = py."InvoiceId"
            INNER JOIN 
                "Terms" t ON v."TermId" = t."id"
            LEFT JOIN (
                SELECT 
                    "PaymentId",
                    "PaymentTransactionId",
                    SUM("AmountPaid") AS "TotalAmountPaid"
                FROM 
                    "PaymentTransactions"
                GROUP BY 
                    "PaymentId", "PaymentTransactionId"  
            ) AS total_amount_paid ON py."PaymentId" = total_amount_paid."PaymentId"
            LEFT JOIN "PaymentTransactions" pt ON total_amount_paid."PaymentTransactionId" = pt."PaymentTransactionId"
            WHERE 
                inv."id" = $1
            ORDER BY 
                py."PaymentId", py."id"
             `,
                values: [billId]
            }

            const [err, getBillDetails] = await Model.getRow(getDetails);

            if (err) {
                return res.status(200).send({ success: false, message: `Something went to wrong please try again` });
            }

            if (!!getBillDetails) {
                return res.status(200).send({ success: true, message: 'Bill details found', contract_details: getBillDetails });
            }
            else {
                return res.status(200).send({ success: true, message: 'Bill details not found' });
            }

        } catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong.`, error: exception.message });
        }
    },
    addBill: async (req, res) => {

        try {
            const { vendorId, contractId, lineLevelGst, transactionId, refNo, dueDate, billDate, roleId, finalTotalAmount, cgst, sgst, igst, utgst, taxSubTotal, total,lines: linesJSON, Files: fileJSON} = req.body;
            if (!vendorId) {
                return res.status(200).send({ success: false, message: `Please enter vendor Id` });
            }
            if (isNaN(vendorId)) {
                return res.status(200).send({ success: false, message: `Invalid Vendor Id` });
            }
            if (!(contractId)) {
                return res.status(200).send({ success: false, message: `Please enter Contract Id` });
            }
            if (isNaN(contractId)) {
                return res.status(200).send({ success: false, message: `Invalid Contract Id` });
            }
            if(!lineLevelGst){
                return res.status(200).send({ success: false, message: `Please enter LineLevelGST` });
            }
            if(isNaN(transactionId)){
                return res.status(200).send({ success: false, message: `Please enter specific Transaction Id` });
            }
            if(!dueDate){
                return res.status(200).send({ success: false, message: `Please enter specific Due Date` });
            }
            if(!Validators.dateValidator(dueDate)){
                return res.status(200).send({ success: false, message: `Invalid Due Date` });
            }
            if(!billDate){
                return res.status(200).send({ success: false, message: `Please enter specific Bill Date` });
            }
            if(!Validators.dateValidator(billDate)){
                return res.status(200).send({ success: false, message: `Invalid Bill Date` });
            }
            if(!roleId){
                return res.status(200).send({ success: false, message: `Please enter specific Role ID` });
            }
        }
        catch (exception) {
            GLOBAL_METHOD.errorMsg(exception);
            return res.status(500).send({ success: false, message: `Something went to wrong`, error: exception.message });
        }
    }
}
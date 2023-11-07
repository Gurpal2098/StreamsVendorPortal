const moment = require("moment");

class Validators {

    /**
     * 
     * @param {string} pincode
     * @description Validates Pincode Number
     * @returns {boolean}
     */
    static pincodeValidator = (pincode) => {
        // if (isNaN(pincode)) {
        //     return false
        // }
        // else {
        //     if (pincode.length == 6) {
        //         return true
        //     }
        //     else {
        //         return false
        //     }
        // }

        const pincodeReg = /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/;
        return pincodeReg.test(pincode)
    };

    /**
     * 
     * @param {string} birthYear
     * @description Validates Birth Year
     * @returns {boolean}
     */
    static birthYearValidator = (birthYear) => {
        if (isNaN(birthYear)) {
            return false
        }
        else {
            if (birthYear.length == 4) {
                return true
            }
            else {
                return false
            }
        }
    };

    /**
     * 
     * @param {string} phoneNumber
     * @description Validates Phone Number
     * @returns {boolean}
     */
    static phoneNumberValidator = (phoneNumber) => {
        // if (isNaN(phoneNumber)) {
        //     return false
        // }
        // else {
        //     if (phoneNumber.length == 10) {
        //         return true
        //     }
        //     else {
        //         return false
        //     }
        // }
        const phoneNumberReg = /^(\+?91|0)?[6789]\d{9}$/
        return  phoneNumberReg.test(phoneNumber)
    };

    /**
     * 
     * @param {string} pancardNumber
     * @description Validates Pancard Number
     * @returns {boolean}
     */
    static panCardValidator = (pancardNumber) => {
        const panReg = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/
        return panReg.test(pancardNumber)
    };

    /**
     * 
     * @param {string} drivingLicenseNumber
     * @description Validates Driving License Number
     * @returns {boolean}
     */
    static drivingLicenseValidator = (drivingLicenseNumber) => {
        const drivReg = /^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$/
        return drivReg.test(drivingLicenseNumber)
    };

    /**
     * 
     * @param {string} aadharCardNumber
     * @description Validates Aadhaar Card Number
     * @returns {boolean}
     */
    // static aadharCardValidator = (aadharCardNumber) => {
    //     let c = 0
    //     const invertedArray = aadharCardNumber.split('').map(Number).reverse()

    //     invertedArray.forEach((val, i) => {
    //         c = mt[c][pt[(i % 8)][val]]
    //     })

    //     return (c === 0)
    // };

    /**
     * 
     * @param {string} emailAddress
     * @description Validates Email Address
     * @returns {boolean}
     */
    static emailValidator = (emailAddress) => {
        const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailReg.test(String(emailAddress).toLowerCase());
    };

    /**
     * 
     * @param {string} string
     * @description Checks if string is alphabetic
     * @returns {boolean}
     */
    static isAlphabetic = (string) => {
        const alphabeticReg = /^[a-zA-Z()]+$/
        return alphabeticReg.test(string);
    };

    /**
     * 
     * @param {string} string
     * @description Checks if string is numeric
     * @returns {boolean}
     */
    static isNumeric = (string) => {
        return !isNaN(string)
    };

    /**
     * 
     * @param {string} string
     * @description Checks if string is alphanumeric
     * @returns {boolean}
     */
    static isAlphaNumeric = (string) => {
        const alphanumericReg = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9 ]+$/;
        return alphanumericReg.test(string)
    };

    /**
     * 
     * @param {string} date 
     * @param {string} seperator 
     * @param {boolean} isoBoolean
     * @description Checks is date in valid format
     * @returns {Array[boolean,string]}
     */
    static isValidDate = (date, seperator, isoBoolean) => {
        const regex = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g;

        if (seperator === "-" || seperator === "/" || seperator === ".") {
            if (date.includes(seperator) && date.split(seperator).length === 3) {

                if (date.match(regex) !== null) {
                    return [true, date]
                }
                else {
                    const splittedDate = date.split(seperator)
                    let newDate = ""

                    if (splittedDate[0].length === 1) {
                        newDate += "0" + splittedDate[0] + "/"
                    }
                    else {
                        newDate += splittedDate[0] + "/"
                    }

                    if (splittedDate[1].length === 1) {
                        newDate += "0" + splittedDate[1] + "/"
                    }
                    else {
                        newDate += splittedDate[1] + "/"
                    }

                    if (splittedDate[2].length === 2) {
                        newDate += moment().utcOffset(330).format("YYYY").slice(0, 2) + splittedDate[2]
                    }
                    else {
                        newDate += splittedDate[2]
                    }

                    if (newDate.match(regex) !== null) {
                        if (isoBoolean) {
                            const isoDate = newDate.split("/").reverse().join("-")
                            return [true, isoDate]
                        }
                        else {
                            return [true, newDate]
                        }
                    }
                    else {
                        return [false, "invalidDate"]
                    }
                }
            }
            else {
                return [false, "invalidDate"]
            }
        }
        return [false, "invalidDate"]
    };

    /**
     * 
     * @param {string} date
     * @description Checks if date is future date
     * @returns {boolean}
     */
    static isFutureDate = (date) => {
        const todayDate = moment(moment().utcOffset(330).format("DD-MM-YYYY"), "DD-MM-YYYY");

        if (date.includes("/")) {
            date = moment(date.split("/").join("-"), "DD-MM-YYYY")
        }
        else {
            date = moment(date, "DD-MM-YYYY")
        }

        if (date.isAfter(todayDate)) { // Earlier used isSameOrAfter
            return true
        } else {
            return false
        }
    };

    /**
     * 
     * @param {string} date
     * @description Checks if date is past date
     * @returns {boolean}
     */
    static isPastDate = (date) => {
        const todayDate = moment(moment().utcOffset(330).format("DD-MM-YYYY"), "DD-MM-YYYY");

        if (date.includes("/")) {
            date = moment(date.split("/").join("-"), "DD-MM-YYYY")
        }
        else {
            date = moment(date, "DD-MM-YYYY")
        }

        if (date.isBefore(todayDate)) { // Earlier used isSameOrBefore
            return true
        } else {
            return false
        }
    };

    /**
   * 
   * @param {string} date
   * @description Checks if date is today date
   * @returns {boolean}
   */
    static isCurrentDate = (date) => {
        const todayDate = moment(moment().utcOffset(330).format("DD-MM-YYYY"), "DD-MM-YYYY");

        if (date.includes("/")) {
            date = moment(date.split("/").join("-"), "DD-MM-YYYY")
        }
        else {
            date = moment(date, "DD-MM-YYYY")
        }

        if (date.isSame(todayDate)) {
            return true
        } else {
            return false
        }
    };

    /**
     * 
     * @param {string} date 
     * @param {string} seperator 
     * @description Checks if age is eighteen plus
     * @returns {Array[boolean, string]}
     */
    static isEighteenPlus = (date, seperator) => {
        if (this.isValidDate(date, seperator)[0], false) {
            const splittedDate = date.split(seperator)
            const age = moment().diff(`${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`, 'years', false);

            if (age >= 18) {
                return [true, age]
            }
            else {
                return [false, "belowEighteen"]
            }
        }
        else {
            return [false, "invalidDate"]
        }
    };

    /**
     * 
     * @param {string} string 
     * @description Checks if string is empty
     * @returns {boolean}
     */
    static isEmpty = (string) => {
        if (string) return true
        return false
    };

    /**
     * 
     * @param {string} string 
     * @description Checks if string is url
     * @returns {boolean}
     */
    static isURL = (string) => {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(string);
    };

        /**
     * 
     * @param {string} dateString
     * @description Checks if string is empty
     * @returns {boolean}
     */
    static dateValidator = (dateString) => {
        // Regular expression to match "YYYY-MM-DD" format
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        if (!dateFormatRegex.test(dateString)) {
            return false;
        }
        
        const dateParts = dateString.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }
        
        const date = new Date(year, month - 1, day); // JavaScript months are zero-based.
        
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    };

};

module.exports = Validators
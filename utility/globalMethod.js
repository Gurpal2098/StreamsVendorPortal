var crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Validators = require('../utility/validations');
require('dotenv').config();


const { SMTP_USER_EMAIL, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT } = require('../utility/constVariables');

// generating hash
const generateHash = () => {
  let hashLength = 16;
  let characters = '1234567890123456';
  let hash = '';
  for (var i = 0; i < characters.length; i++) {
    hash = hash + characters.charAt(Math.random() * (hashLength - 0) + 0);

  }
  return hash;
}

// generating otp
const generateOTP = function (otpLength = 4) {
  return 1234;
  let baseNumber = Math.pow(10, otpLength - 1);
  let number = Math.floor(Math.random() * baseNumber);
  /*
  Check if number have 0 as first digit
  */
  if (number < baseNumber) {
    number += baseNumber;
  }
  return number;

};

// genearting access token
const generateToken = (userId) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
    time: Date(),
    userId: userId,
  }
  const token = jwt.sign(data, jwtSecretKey);
  return token;
};

//   validate access token
const validateToken = (ActualToken) => {
  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  try {
    const verified = jwt.verify(ActualToken, jwtSecretKey);
    if (verified) {
      return true;
    } else {
      // Access Denied
      return false;
    }
  } catch (error) {
    // Access Denied
    return false;
  }
};

// encrypting password
const encrypt = (string) => {
  let iv = '1234567890123456';
  let hash = generateHash();
  let cipher = crypto.createCipheriv('aes-128-cbc', hash, iv);
  let encrypted = cipher.update(string, 'utf8', 'binary');
  encrypted += cipher.final('binary');
  let hexVal = new Buffer.from(encrypted, 'binary');
  let newEncrypted = hexVal.toString('hex');
  return { 'password': newEncrypted, 'hash': hash };
}

// decrypting password
const decrypt = (password, hash) => {
  console.log(hash, password, "passwordddd");
  let iv = '1234567890123456';
  let decipher = crypto.createDecipheriv('aes-128-cbc', hash, iv);
  let decrypted = decipher.update(password, 'hex', 'binary');
  decrypted += decipher.final('binary');
  return decrypted;
}

// decrypting password  and checking with password
const decryption = (oldPassword, password, hash) => {
  let decryptPassword = decrypt(password, hash);
  if (oldPassword == decryptPassword) {
    return true
  } else {
    return false
  }
};

const errorMsg = (err) => console.log("[ ERROR ] : " + '\u001b[' + 31 + 'm' + err + '\u001b[0m');

const diff_minutes = (dt2, dt1) => {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  return Math.abs(Math.round(diff));

}

const send_email = (message, callback) => {
  let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    // secure: false,
    // secureConnection: false,
    // tls: {
    //   ciphers:'SSLv3'
    // },
    // requireTLS:true,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER_EMAIL,
      pass: SMTP_PASSWORD
    }
  });


  transporter.sendMail(message, function (err, info) {
    console.log(err)

    if (info) {
      console.log("success", info)
      return callback("success");
    } else {
      return callback("fail");
    }
  });

};
const randomString = () => {
  return 'VP_STREAMS' + Math.floor(Math.random() * Date.now()).toString(16);
};

const validateEmailsInArray = (array) => {
  const invalidEmails = [];
  for (const obj of array) {
    const { firstName, email } = obj;
    if (!Validators.emailValidator(email)) {
      invalidEmails.push({ firstName, email });
    }
  }
  return invalidEmails;
}

const validateLineItemsInArray = (array) => {
  const pattern = /^-?[0-9]+$/;
  for (const obj of array) {
    const { item, totalAmount, baseRate, quantity } = obj;
    if ((!pattern.test(item) || item <= 0) || (isNaN(totalAmount) || totalAmount <= 0) || (isNaN(baseRate) || baseRate <= 0) || (!pattern.test(quantity) || quantity <= 0)) {
      return false
    }
  }
  return true;
}


// const createDirectoryIfNotExists = (directoryPath) => {
//   if (!fs.existsSync(directoryPath)) {
//     fs.mkdirSync(directoryPath, { recursive: true });
//     return directoryPath;
//   } else {
//     return directoryPath;
//   }
// }


module.exports = {
  encrypt,
  decrypt,
  generateOTP,
  decryption,
  generateToken,
  validateToken,
  errorMsg,
  diff_minutes,
  send_email,
  randomString,
  validateEmailsInArray,
  validateLineItemsInArray

};





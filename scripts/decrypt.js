const CryptoJS = require("crypto-js");
const fs = require('fs');

const script = process.argv[1];
const password = process.argv[2];
const infile = process.argv[3];
const outfile = process.argv[4];

if (!infile || !password) {
  console.log(`Usage: node {script} <password> <infile> <outfile>`);
  process.exit(1);
}

const fileContent = fs.readFileSync(infile, 'utf-8');
const decrypted = CryptoJS.AES.decrypt(fileContent, password).toString(CryptoJS.enc.Utf8);
fs.writeFileSync(outfile, decrypted);

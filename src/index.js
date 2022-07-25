const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '../.env') });
const { exec } = require('child_process');
const { promisify } = require('util');

const { analyzeLogsFile } = require('./utils/analyzeLogsFile');
const JsonReport = require('./utils/updateJsonReport');

const jsonReport = new JsonReport();

(async () => {
  try {
    await promisify(exec)('echo "" > logs.txt');

    await promisify(exec)(`npm test > logs.txt`);

    jsonReport.reset();
    console.log(`-----------------------------------------------------------------------
---------- MCCP TEST PASSED --[   ${new Date().toLocaleString()}   ]------------`);
  } catch (error) {
    console.log(`<<------------------------------------------------------------------->>
<<------- MCCP TEST FAILED --[   ${new Date().toLocaleString()}   ]---------->>`);
    analyzeLogsFile();
  }
})();

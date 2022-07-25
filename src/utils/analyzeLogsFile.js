const { insuranceCompaniesList } = require('./insuranceCompaniesList');
const { readLogs } = require('./readLogs');
const { sendSMS } = require('./sendSMS');
const JsonReport = require('./updateJsonReport');

module.exports.analyzeLogsFile = async () => {
  const logs = await readLogs();
  const failedTest = [...new Set(logs)];

  const jsonReport = new JsonReport();

  if (failedTest.length > 0) {
    const corpWithFailedTest = [];
    for (const corp of Object.keys(insuranceCompaniesList)) {
      if (failedTest.join(', ').includes(corp)) {
        await jsonReport.addValue(corp);
        if (
          (await jsonReport.getReport())[corp] <= (+process.env.THRESHOLD || 3)
        ) {
          corpWithFailedTest.push(insuranceCompaniesList[corp]);
        }
      } else {
        await jsonReport.resetCorp(corp);
      }
    }

    const numbers = process.env.NUMBERS;

    if (numbers && corpWithFailedTest.length) {
      return sendSMS(numbers.replace(/\s/g, '').split(','), corpWithFailedTest);
    }
  }
};

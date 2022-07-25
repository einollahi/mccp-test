const axios = require('axios');

const { readFile, writeFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');

const SMS_API = process.env.BIME_API;

module.exports.sendSMS = async (numbers, failed_test) => {
  if (!Array.isArray(numbers)) throw new Error('numbers are not valid.');

  if (!failed_test?.length)
    throw new Error('failed test information is not defined ');

  const date = new Date();

  if (+date.getHours() >= 22 || +date.getHours() < 8) return;
  else {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const message = `در تاریخ ${date.toLocaleTimeString(
      'fa',
      options
    )} سرویس های زیر کند بودند یا با اختلال مواجه شده است. ${failed_test.join(
      ' ,  '
    )}`;

    try {
      const isSMSSendedRecently = await checkLastSendedSMS();

      if (isSMSSendedRecently) {
        axios.post(SMS_API, { telNoList: [...numbers], message });
        await updateSMSLog();
      } else {
        console.log('too many sending sms request');
      }
    } catch (error) {
      console.log('Error: ', error);
    }
  }
};

const checkLastSendedSMS = async () => {
  const smsLogs = await promisify(readFile)(
    join(__dirname, '../../sms.log'),
    'utf8'
  );

  if (!smsLogs) {
    await updateSMSLog();
    return true;
  } else {
    const smsSendedTime = new Date(smsLogs).getTime();
    const currentTime = new Date().getTime();

    if ((currentTime - smsSendedTime) / 1000 > 150) return true;
    else return false;
  }
};

const updateSMSLog = async () => {
  const data = new Date();

  await promisify(writeFile)(
    join(__dirname, '../../sms.log'),
    data.toString(),
    'utf8'
  );
};

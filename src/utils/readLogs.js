const { readFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');

const pattern = /\d+\) test << ([a-z]+) >> is processed/g;

module.exports.readLogs = async () => {
  const file = await promisify(readFile)(
    join(__dirname, '../../logs.txt'),
    'utf8'
  );
  return file.match(pattern);
};

const { readFile, writeFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { insuranceCompaniesList } = require('./insuranceCompaniesList');

module.exports = class JsonReport {
  static instance = null;
  corpStatus = {};

  constructor() {
    if (!JsonReport.instance) {
      JsonReport.instance = this;
    }

    return JsonReport.instance;
  }

  async reset() {
    Object.getOwnPropertyNames(insuranceCompaniesList).forEach((corp) => {
      this.corpStatus[corp] = 0;
    });

    await this.writeJsonFile();
  }

  async resetCorp(...corpNames) {
    await this.readJsonFile();

    corpNames.forEach((corpName) => {
      this.corpStatus[corpName] = 0;
    });

    await this.writeJsonFile();
  }

  async addValue(corpName) {
    await this.readJsonFile();

    this.corpStatus[corpName] = (+this.corpStatus[corpName] || 0) + 1;

    await this.writeJsonFile();
  }

  async getReport() {
    return this.corpStatus;
  }

  async readJsonFile() {
    const corpStatus = await promisify(readFile)(
      join(__dirname, '../../report.json'),
      'utf8'
    );

    this.corpStatus = JSON.parse(corpStatus);
  }

  async writeJsonFile() {
    await promisify(writeFile)(
      join(__dirname, '../../report.json'),
      JSON.stringify(this.corpStatus),
      'utf8'
    );
  }
};

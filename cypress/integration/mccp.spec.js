/// <reference types="cypress" />

const opt = { timeout: Cypress.env('TIMEOUT') * 1000 };
const waitDurationAfterTest = Cypress.env('WAIT') * 1000;

const activeCorp = Cypress.env('ACTIVE_CORP');
const corpConfig = Cypress.env(activeCorp);

const username = corpConfig['USERNAME'];
const password = corpConfig['PASSWORD'];

let insuranceCompanies = corpConfig['CORPS'];
const excludeInsuranceCompanies = Cypress.env('EXCLUDE') || [];

insuranceCompanies = insuranceCompanies.filter(corp => !excludeInsuranceCompanies.includes(corp));

for (const corpName of insuranceCompanies) {
  describe(`TEST MCCP <${corpName.toUpperCase()}>`, () => {
    let startTime;
    let endTime;
    before(() => {
      cy.fixture(`production/${corpName}`).then((corp) => {
        window.localStorage.setItem(`${username}_corp`, JSON.stringify(corp));
      });
    });

    it(`test << ${corpName} >> is processed`, () => {
      cy.visit('/', opt);
      cy.intercept('POST', '**/token').as('token');

      cy.intercept('GET', `**/getMedicalCenter**`).as('getMedicalCenter');

      cy.get('#username').type(username);
      cy.get('#password').type(password);

      cy.get('.mat-checkbox-inner-container').click();
      startTime = new Date();

      cy.contains('button[type="submit"]', 'ورود به سایت').click();

      cy.wait('@token', opt);
      cy.get('@token', opt).then((token_xhr) => {
        const { statusCode } = token_xhr.response;

        if (statusCode === 200) {
          cy.wait('@getMedicalCenter', opt);
          cy.get('@getMedicalCenter', opt).then((medical_center_xhr) => {
            const { statusCode, body } = medical_center_xhr.response;

            if (body.value.length) {
              const { IsActive, HasContract } = body.value[0];

              expect(statusCode).to.equals(200);

              if (IsActive && HasContract) {
                cy.get('#mcPreAuthList', opt).click();
                loadingIndicator();
              }
            }
            endTime = new Date();

            const waitFor = endTime - startTime;
            if (waitFor < waitDurationAfterTest) {
              cy.wait(waitDurationAfterTest - waitFor);
            }
          });
        } else if (statusCode === 400) {
          cy.wait(waitDurationAfterTest, opt);
        } else {
          // error.error='invalid_grant'
          // error.error_description
          throw new Error('Server failed');
        }
      });
    });
  });
}

function loadingIndicator() {
  cy.get('.loading-indicator', opt).should('be.visible');
  cy.get('.loading-indicator', opt).should('not.exist');
}

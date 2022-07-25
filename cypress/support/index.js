import './commands';

Cypress.Server.defaults({
  delay: 500,
  force404: false,
  whitelist: (xhr) => {
    return true;
  },
});

// cypress/e2e/addService.cy.js
describe('Add Service Functionality', () => {
  const testService = {
    name: 'Test Service',
    category: 'Nägel',
    description: 'This is a test description that is longer than 50 characters to pass validation',
    price: '49.99',
    timeSpan: '60min',
    image: 'test-image.jpg'
  };

  beforeEach(() => {
    // Stub the API requests
    cy.intercept('POST', 'http://localhost:5000/api/services').as('addService');
    cy.visit('/services/add');
  });

  it('should display the add service form for admin users', () => {
    cy.get('.card-header').should('contain', 'Add Service');
    cy.get('form').should('exist');
    cy.get('#name').should('exist');
    cy.get('#category').should('exist');
    cy.get('#description').should('exist');
    cy.get('#price').should('exist');
    cy.get('#timeSpan').should('exist');
    cy.get('#image').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Add Service');
  });

  it('should validate service name field', () => {
    cy.testFieldValidation(
      '#name',
      ['', 'abc', 'Test123'],
      [
        'Service name is required',
        'Minimum 4 characters required',
        'Only letters are allowed'
      ],
      testService.name
    );
  });

  it('should validate category field', () => {
    cy.testSelectValidation(
      '#category',
      'Category is required',
      testService.category
    );
  });

  it('should validate description field', () => {
    cy.testFieldValidation(
      '#description',
      ['', 'Too short'],
      [
        'Description is required',
        'Minimum 50 characters required'
      ],
      testService.description
    );
  });

  it('should validate price field', () => {
    cy.testFieldValidation(
      '#price',
      ['', '-10'],
      [
        'Price is required',
        'Price cannot be negative'
      ],
      testService.price
    );
  });

  it('should validate time span field', () => {
    cy.testFieldValidation(
      '#timeSpan',
      ['', '60 minutes'],
      [
        'Time span is required',
        "Format must be like '60min'"
      ],
      testService.timeSpan
    );
  });

  it('should validate image field', () => {
    cy.fillServiceForm(testService, false);
    cy.get('button[type="submit"]').click();
    cy.get('#image').should('have.class', 'is-invalid');
    cy.get('.invalid-feedback').should('contain', 'Please select an image');
  });

  it('should successfully add a service with valid data', () => {
    // Mock the successful response
    cy.intercept('POST', 'http://localhost:5000/api/services', {
      statusCode: 201,
      body: {
        message: 'Service successfully added',
        serviceId: 123,
        ...testService,
        imageUrl: '/images/test-image.jpg'
      }
    }).as('mockAddService');

    cy.fillServiceForm(testService, true);
    cy.get('button[type="submit"]').click();
    
    cy.wait('@mockAddService').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });

    // Verify form reset
    cy.get('#name').should('have.value', '');
    cy.get('#image').should('have.value', '');
  });

});

// Custom Commands
Cypress.Commands.add('fillServiceForm', (serviceData, includeImage) => {
  cy.get('#name').clear().type(serviceData.name);
  cy.get('#category').select(serviceData.category);
  cy.get('#description').clear().type(serviceData.description);
  cy.get('#price').clear().type(serviceData.price);
  cy.get('#timeSpan').clear().type(serviceData.timeSpan);
  
  if (includeImage) {
    cy.get('#image').attachFile(serviceData.image);
  }
});

Cypress.Commands.add('testFieldValidation', (selector, invalidValues, errorMessages, validValue) => {
  invalidValues.forEach((value, index) => {
    cy.get(selector).clear().type(value).blur();
    cy.get(selector).should('have.class', 'is-invalid');
    cy.get(`${selector} + .invalid-feedback`).should('contain', errorMessages[index]);
  });

  // Test valid value
  cy.get(selector).clear().type(validValue).blur();
  cy.get(selector).should('not.have.class', 'is-invalid');
});

Cypress.Commands.add('testSelectValidation', (selector, errorMessage, validValue) => {
  // Test empty value
  cy.get(selector).select('').blur();
  cy.get(selector).should('have.class', 'is-invalid');
  cy.get(`${selector} + .invalid-feedback`).should('contain', errorMessage);

  // Test valid value
  cy.get(selector).select(validValue).blur();
  cy.get(selector).should('not.have.class', 'is-invalid');
});
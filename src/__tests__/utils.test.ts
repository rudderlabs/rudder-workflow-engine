import jsonata from 'jsonata';
import { SimpleStep, Step } from '../types';
import { WorkflowUtils } from '../utils';
const { isSimpleStep, isWorkflowStep, isAssertError, jsonataPromise } = WorkflowUtils;

describe('Cases for isSimpleStep', () => {
  const isSimpleStepCases = [
    {
      caseName: 'should return true when template is provided',
      caseInput: {
        name: 'template_step',
        template: 'some_template',
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return true when templatePath is provided',
      caseInput: {
        name: 'template_step',
        templatePath: 'template/path.yaml',
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return true when functionPath is provided',
      caseInput: {
        name: 'template_step',
        functionName: 'my_function_name',
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return true when externalWorkflow is provided',
      caseInput: {
        name: 'template_step',
        externalWorkflow: 'my_workflow',
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return false when workflowPath is provided',
      caseInput: {
        name: 'template_step',
        workflowPath: 'my_workflow/path.yaml',
      } as Step,
      expectedOutput: false,
    },
  ];
  test.each(isSimpleStepCases)('$caseName', ({ caseInput, expectedOutput }) => {
    expect(isSimpleStep(caseInput)).toBe(expectedOutput);
  });
});

describe('Cases for isWorkflowStep', () => {
  const isWorkflowStepCases = [
    {
      caseName: 'should return true when steps is provided',
      caseInput: {
        name: 'template_step',
        steps: [
          {
            name: 'step_1',
            templatePath: 'my_step/template/path.yaml',
          } as SimpleStep,
        ],
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return true when workflowPath is provided',
      caseInput: {
        name: 'template_step',
        workflowPath: 'template/path.yaml',
      } as Step,
      expectedOutput: true,
    },
    {
      caseName: 'should return false when steps is provided as empty array',
      caseInput: {
        name: 'template_step',
        steps: [],
      } as Step,
      expectedOutput: false,
    },
  ];

  test.each(isWorkflowStepCases)('$caseName', ({ caseInput, expectedOutput }) => {
    expect(isWorkflowStep(caseInput)).toBe(expectedOutput);
  });
});

describe('Cases for isWorkflowStep', () => {
  const isAssertErrorCases = [
    {
      caseName: 'should return true',
      caseInput: {
        token: 'assert',
      },
      expectedOutput: true,
    },
    {
      caseName: 'should return false',
      caseInput: {},
      expectedOutput: false,
    },
    {
      caseName: 'should return false',
      caseInput: {
        key: 'value',
      },
      expectedOutput: false,
    },
  ];

  test.each(isAssertErrorCases)(
    '$caseName when $caseInput is provided',
    ({ caseInput, expectedOutput }) => {
      expect(isAssertError(caseInput)).toBe(expectedOutput);
    },
  );
});

describe('Cases for jsonataPromise', () => {
  test('should return a value when jsonata function(sum) is used', async () => {
    const inputPayload = {
      Account: {
        'Account Name': 'Firefly',
        Order: [
          {
            OrderID: 'order103',
            Product: [
              {
                'Product Name': 'Bowler Hat',
                ProductID: 858383,
                SKU: '0406654608',
                Description: {
                  Colour: 'Purple',
                  Width: 300,
                  Height: 200,
                  Depth: 210,
                  Weight: 0.75,
                },
                Price: 34.45,
                Quantity: 2,
              },
              {
                'Product Name': 'Trilby hat',
                ProductID: 858236,
                SKU: '0406634348',
                Description: {
                  Colour: 'Orange',
                  Width: 300,
                  Height: 200,
                  Depth: 210,
                  Weight: 0.6,
                },
                Price: 21.67,
                Quantity: 1,
              },
            ],
          },
          {
            OrderID: 'order104',
            Product: [
              {
                'Product Name': 'Bowler Hat',
                ProductID: 858383,
                SKU: '040657863',
                Description: {
                  Colour: 'Purple',
                  Width: 300,
                  Height: 200,
                  Depth: 210,
                  Weight: 0.75,
                },
                Price: 34.45,
                Quantity: 4,
              },
              {
                ProductID: 345664,
                SKU: '0406654603',
                'Product Name': 'Cloak',
                Description: {
                  Colour: 'Black',
                  Width: 30,
                  Height: 20,
                  Depth: 210,
                  Weight: 2,
                },
                Price: 107.99,
                Quantity: 1,
              },
            ],
          },
        ],
      },
    };
    const expression = jsonata(`$sum(Account.Order.Product.(Price * Quantity))`);
    await expect(jsonataPromise(expression, inputPayload, {})).resolves.toBe(336.36);
  });

  test('should return an object when jsonata expression are present', async () => {
    const inputPayload = {
      FirstName: 'Fred',
      Surname: 'Smith',
      Age: 28,
      Address: {
        Street: 'Hursley Park',
        City: 'Winchester',
        Postcode: 'SO21 2JN',
      },
      Phone: [
        {
          type: 'home',
          number: '0203 544 1234',
        },
        {
          type: 'office',
          number: '01962 001234',
        },
        {
          type: 'office',
          number: '01962 001235',
        },
        {
          type: 'mobile',
          number: '077 7700 1234',
        },
      ],
      Email: [
        {
          type: 'office',
          address: ['fred.smith@my-work.com', 'fsmith@my-work.com'],
        },
        {
          type: 'home',
          address: ['freddy@my-social.com', 'frederic.smith@very-serious.com'],
        },
      ],
      Other: {
        'Over 18 ?': true,
        Misc: null,
        'Alternative.Address': {
          Street: 'Brick Lane',
          City: 'London',
          Postcode: 'E1 6RF',
        },
      },
    };
    const expression = jsonata(
      `{
        "name": FirstName & " " & Surname,
        "mobile": Phone[type = "mobile"].number
      }`,
    );
    await expect(jsonataPromise(expression, inputPayload, {})).resolves.toMatchObject({
      name: 'Fred Smith',
      mobile: '077 7700 1234',
    });
  });

  test('should return a value when evaluated with user-defined binding functions', async () => {
    const bindings = {
      pi: Math.PI,
      getCosine: (num) => {
        return Number(Math.cos(num).toFixed(2));
      },
    };
    const inputPayload = {
      angle: 60,
    };
    const expression = jsonata(`$getCosine(angle * $pi/180)`);
    await expect(jsonataPromise(expression, inputPayload, bindings)).resolves.toBe(0.5);
  });
});

import jsonata from 'jsonata';
import { SimpleStep, Step } from '../types';
import { WorkflowUtils } from '../utils';
const { isSimpleStep, isWorkflowStep, isAssertError, jsonataPromise, xor } = WorkflowUtils;

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
      caseName:
        'should return false when only unrecognised field(s) are provided(workflowPath in this case)',
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
    {
      caseName: 'should return false when steps is provided as object',
      caseInput: {
        name: 'template_step',
        steps: {
          someKey: 'value',
        },
      } as Step,
      expectedOutput: false,
    },
    {
      caseName: 'should return false when steps and workflowPath are provided',
      caseInput: {
        name: 'template_step',
        steps: [
          {
            name: 'step_1',
            templatePath: 'my_step/template/path.yaml',
          } as SimpleStep,
        ],
        workflowPath: 'template/path.yaml',
      } as Step,
      expectedOutput: false,
    },
    {
      caseName: 'should return false when steps and workflowPath are not provided',
      caseInput: {
        name: 'template_step',
      } as Step,
      expectedOutput: false,
    },
  ];

  test.each(isWorkflowStepCases)('$caseName', ({ caseInput, expectedOutput }) => {
    expect(isWorkflowStep(caseInput)).toBe(expectedOutput);
  });
});

describe('Cases for xor', () => {
  const xorCases = [
    {
      cond1: true,
      cond2: true,
      expectedOut: false,
    },
    {
      cond1: true,
      cond2: false,
      expectedOut: true,
    },
    {
      cond1: false,
      cond2: true,
      expectedOut: true,
    },
    {
      cond1: false,
      cond2: false,
      expectedOut: false,
    },
  ];
  test.each(xorCases)('xor($cond1, $cond2)===$expectedOut', ({ cond1, cond2, expectedOut }) => {
    expect(xor(cond1, cond2)).toBe(expectedOut);
  });
});

describe('Cases for isAssertError', () => {
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
  test('should return a value when evaluated with async user-defined binding functions', async () => {
    const bindings = {
      asyncAdd: (a, b) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(a + b);
          }, 100);
        });
      },
    };
    const inputPayload = {
      angle: 70,
      val1: 12,
      val2: 145,
    };
    const expression = jsonata(`
      (
        $a:=$asyncAdd(val1, val2);
        $b:=$asyncAdd($a,val2);
        {
          "angle": angle,
          "total": $a,
          "cumTotal": $b
        }
      )
    `);
    await expect(jsonataPromise(expression, inputPayload, bindings)).resolves.toMatchObject({
      total: 157,
      angle: 70,
      cumTotal: 302,
    });
  });

  test('should return a valid object when evaluated with joins(kind-of) use-case', async () => {
    // Note: This test-case and the expression is a good use-case for kind of joins in jsonata
    const inputPayload = {
      library: {
        books: [
          {
            title: 'Structure and Interpretation of Computer Programs',
            authors: ['Abelson', 'Sussman'],
            isbn: '9780262510875',
            price: 38.9,
            copies: 2,
          },
          {
            title: 'The C Programming Language',
            authors: ['Kernighan', 'Richie'],
            isbn: '9780131103627',
            price: 33.59,
            copies: 3,
          },
          {
            title: 'The AWK Programming Language',
            authors: ['Aho', 'Kernighan', 'Weinberger'],
            isbn: '9780201079814',
            copies: 1,
          },
          {
            title: 'Compilers: Principles, Techniques, and Tools',
            authors: ['Aho', 'Lam', 'Sethi', 'Ullman'],
            isbn: '9780201100884',
            price: 23.38,
            copies: 1,
          },
        ],
        loans: [
          {
            customer: '10001',
            isbn: '9780262510875',
            return: '2016-12-05',
          },
          {
            customer: '10003',
            isbn: '9780201100884',
            return: '2016-10-22',
          },
          {
            customer: '10003',
            isbn: '9780262510875',
            return: '2016-12-22',
          },
        ],
        customers: [
          {
            id: '10001',
            name: 'Joe Doe',
            address: {
              street: '2 Long Road',
              city: 'Winchester',
              postcode: 'SO22 5PU',
            },
          },
          {
            id: '10002',
            name: 'Fred Bloggs',
            address: {
              street: '56 Letsby Avenue',
              city: 'Winchester',
              postcode: 'SO22 4WD',
            },
          },
          {
            id: '10003',
            name: 'Jason Arthur',
            address: {
              street: '1 Preddy Gate',
              city: 'Southampton',
              postcode: 'SO14 0MG',
            },
          },
        ],
      },
    };
    const expression = jsonata(
      `library.loans@$L.books@$B[$L.isbn=$B.isbn].customers[$L.customer=id].{
        'customer': name,
        'book': $B.title,
        'due': $L.return
      }`,
    );

    const expectedOutputs = [
      {
        customer: 'Joe Doe',
        book: 'Structure and Interpretation of Computer Programs',
        due: '2016-12-05',
      },
      {
        customer: 'Jason Arthur',
        book: 'Compilers: Principles, Techniques, and Tools',
        due: '2016-10-22',
      },
      {
        customer: 'Jason Arthur',
        book: 'Structure and Interpretation of Computer Programs',
        due: '2016-12-22',
      },
    ];

    await expect(jsonataPromise(expression, inputPayload, {})).resolves.toEqual(
      expect.arrayContaining(expectedOutputs),
    );
  });

  test('should reject the promise when expression throws an error', async () => {
    const inputPayload = {
      Order: [
        {
          Price: 100,
          Quantity: 1,
        },
      ],
    };
    const expression = jsonata(`($assert(Order[0].Price < 40, 'Too Expensive'); Order[0].Price)`);
    expect.assertions(1);
    await expect(jsonataPromise(expression, inputPayload, {})).rejects.toMatchObject({
      code: 'D3141',
      message: 'Too Expensive',
    });
  });

  test('should reject the promise when binding throws an error', async () => {
    const extFailMockAPI = () => {
      return new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject({
            data: 'Failed to obtain data',
            statusCode: 400,
          });
        }, 100);
      });
    };
    const bindings = {
      extAPICall: extFailMockAPI,
    };
    const inputPayload = {
      payKey: 'value',
    };
    const expr = jsonata(
      `$a := $extAPICall()
      {
        a: $a,
        key: payKey
      }
    `,
    );
    expect.assertions(1);
    await expect(jsonataPromise(expr, inputPayload, bindings)).rejects.toMatchObject({
      data: 'Failed to obtain data',
      statusCode: 400,
    });
  });
});

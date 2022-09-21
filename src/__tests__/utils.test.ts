import jsonata from 'jsonata';
import { doReturn } from '../bindings';
import { SimpleStep, Step } from '../types';
import { WorkflowUtils } from '../utils';
const { isSimpleStep, isWorkflowStep, isAssertError, jsonataPromise, xor } = WorkflowUtils;

// IMP NOTES:
// - About error thrown from jsonata
//    error also contains stack with all stack-trace
//    But for simplicity this has not been captured through test-case

const commonStepCases = [
  {
    caseName: 'should return false when no field(s) are provided',
    caseInput: {} as Step,
    expectedOutput: false,
  },
  {
    caseName: 'should return false when null is sent as step',
    caseInput: null,
    expectedOutput: false,
  },
];
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
      caseName: 'should return true when functionName is provided',
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
    {
      caseName: 'should return false when no recognised field(s) are provided',
      caseInput: {
        name: 'template_step',
      } as Step,
      expectedOutput: false,
    },
    ...commonStepCases,
  ];
  test.each(isSimpleStepCases)('$caseName', ({ caseInput, expectedOutput }) => {
    // @ts-ignore
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
    ...commonStepCases,
  ];

  test.each(isWorkflowStepCases)('$caseName', ({ caseInput, expectedOutput }) => {
    // @ts-ignore
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
        Order: [
          {
            Product: [
              {
                Price: 34.45,
                Quantity: 2,
              },
              {
                Price: 21.67,
                Quantity: 1,
              },
            ],
          },
          {
            Product: [
              {
                Price: 34.45,
                Quantity: 4,
              },
              {
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

  test('should reject the promise when async binding rejects with an error', async () => {
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
  test('should fail when async binding throws an error', async () => {
    const extFailMockAPI = () => {
      return new Promise((_resolve, _reject) => {
        throw new Error('unknown failure in api call');
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
    await expect(jsonataPromise(expr, inputPayload, bindings)).rejects.toThrowError(
      'unknown failure in api call',
    );
  });
  test('should pass when async binding throws an error but is caught in promise', async () => {
    const extFailMockAPI = () => {
      doReturn('doReturn error');
    };
    const bindings = {
      extAPICall: extFailMockAPI,
    };
    const inputPayload = {
      payKey: 'value',
    };
    const expr = jsonata(
      `(
        $a := $extAPICall();
        {
          "a": $a,
          "key": payKey
        }
      )
    `,
    );
    await expect(jsonataPromise(expr, inputPayload, bindings)).resolves.toEqual('doReturn error');
  });
  test('should pass even when data is missing', async () => {
    const extAPICall = () => {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve({
            k1: 'v1',
            k2: 'v2',
          });
        });
      });
    };
    const bindings = {
      extAPICall,
    };
    const expr = jsonata(
      `(
        $a := $extAPICall();
        {
          "a": $a
        }
      )
    `,
    );
    await expect(jsonataPromise(expr, null, bindings)).resolves.toMatchObject({
      a: {
        k1: 'v1',
        k2: 'v2',
      },
    });
  });
  test('should fail when empty expression is provided', async () => {
    try {
      const extAPICall = () => {
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            resolve({
              k1: 'v1',
              k2: 'v2',
            });
          });
        });
      };
      const bindings = {
        extAPICall,
      };
      const expr = jsonata(``);
      await jsonataPromise(expr, null, bindings);
    } catch (error) {
      expect(error).toMatchObject({
        code: 'S0207',
        position: 0,
        token: '(end)',
        message: 'Unexpected end of expression',
      });
    }
  });

  test('should fail when the binding provided is not present', async () => {
    const bindings = {
      // binding is provided but not present
      extAPICall: undefined,
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
      code: 'T1006',
      message: 'Attempted to invoke a non-function',
      position: 18,
      token: 'extAPICall',
    });
  });
});

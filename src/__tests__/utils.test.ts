import { SimpleStep, Step } from '../types';
import { WorkflowUtils } from '../utils';
const { isSimpleStep, isWorkflowStep, isAssertError } = WorkflowUtils;

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

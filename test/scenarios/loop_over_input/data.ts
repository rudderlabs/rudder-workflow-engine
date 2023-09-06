export const data = [
  {
    input: {
      description: 'I am not array so I will fail',
    },
    error: {
      message: 'loopOverInput requires array input',
    },
  },
  {
    input: {
      elements: [
        {
          description: 'I will return error',
          error: {
            message: 'some error',
          },
          skip: true,
        },
        {
          description: 'I will return the same output',
          output: {
            hello: 'world',
          },
        },
        {
          description: 'I will return custom output',
        },
      ],
    },
    output: [
      {
        error: {
          message: 'some error',
          status: 500,
          error: expect.any(Error),
          originalError: expect.any(Error),
        },
      },
      {
        output: {
          hello: 'world',
        },
      },
      {
        output: {
          foo: 'bar',
        },
      },
    ],
  },
  {
    workflowPath: 'loop_condition.yaml',
    input: {
      elements: [
        {
          description: 'I will return error',
          error: {
            message: 'some error',
          },
        },
        {
          description: 'I will return the same output',
          output: {
            hello: 'world',
          },
          execute: true,
        },
        {
          description: 'I will return custom output',
        },
      ],
    },
    output: [
      {
        skipped: true,
      },
      {
        output: {
          hello: 'world',
        },
      },
      {
        skipped: true,
      },
    ],
  },
];

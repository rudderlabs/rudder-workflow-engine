import { Scenario } from '../../types';

export const data: Scenario[] = [
  {
    workflowYAML: `
name: simple
steps:
    - name: step1
      template: |
        "hello world"
`,
    output: 'hello world',
  },
];

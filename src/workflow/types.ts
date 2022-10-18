import { Dictionary } from '../common/types';
import { Step } from '../steps/types';

export type Binding = {
  // exported value's name in bindings
  // if not specified then all paths will be exported
  name?: string;
  // the file from which the export has to be looked at
  // defaults to bindings.js
  path?: string;
  // Export all when name specified
  exportAll?: true;
};

export type ExecutionBindings = {
  [key: string]: any;
  outputs: Dictionary<any>;
  context: Dictionary<any>;
  setContext: (string, any) => void;
};

export type Workflow = {
  name: string;
  bindings?: Binding[];
  steps: Step[];
};

export type WorkflowOutput = {
  output?: any;
  outputs?: Dictionary<any>;
  status?: number;
  error?: any;
};

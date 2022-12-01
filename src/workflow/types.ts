import { Dictionary } from '../common/types';
import { Step, TemplateType } from '../steps/types';

export type PathBinding = {
  // exported value's name in bindings
  // if not specified then all paths will be exported
  name?: string;
  value?: any;
  // the file from which the export has to be looked at
  // defaults to bindings.js / bindings.ts
  path?: string;
  // Export all when name specified
  exportAll?: true;
};

export type ValueBinding = {
  name: string;
  value: any;
};

export type ParentBinding = {
  name: string;
  fromParent: true;
};

export type Binding = PathBinding | ValueBinding | ParentBinding;

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
  options?: WorkflowOptions;
};

export type WorkflowOutput = {
  output?: any;
  outputs?: Dictionary<any>;
  status?: number;
  error?: any;
};

export type WorkflowOptions = {
  bindingsPaths?: string[];
  templateType?: TemplateType;
  parentBindings?: Dictionary<any>;
};

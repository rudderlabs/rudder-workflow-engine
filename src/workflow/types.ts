import { Step, TemplateType } from '../steps/types';
import { WorkflowEngine } from './engine';

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
  outputs: Record<string, any>;
  context: Record<string, any>;
  setContext: (string, any) => void;
};

export type Workflow = {
  name: string;
  bindings?: Binding[];
  steps: Step[];
  templateType?: TemplateType;
  // Executor name will be searched in the bindings
  executor?: string;
};

export type WorkflowOutput = {
  output?: any;
  outputs?: Record<string, any>;
  status?: number;
  error?: any;
};

export type WorkflowOptions = {
  bindingsPaths?: string[];
  rootPath: string;
  creationTimeBindings?: Record<string, any>;
  templateType?: TemplateType;
  executor?: WorkflowExecutor;
};

export type WorkflowOptionsInternal = WorkflowOptions & {
  currentBindings: Record<string, any>;
  parentBindings?: Record<string, any>;
};

export interface WorkflowExecutor {
  execute(engine: WorkflowEngine, input: any): Promise<WorkflowOutput>;
}

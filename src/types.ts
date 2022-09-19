import jsonata from 'jsonata'
import { WorkflowEngine } from './workflow'

export type StatusError = {
  status: number
  message: string
}
export type StepOutput = {
  error?: StatusError
  skipped?: boolean
  output?: any
  outputs?: Record<any, string>
}

export enum StepType {
  Simple = 'simple',
  Workflow = 'workflow'
}
export enum StepExitAction {
  Return = 'return',
  Continue = 'continue'
}
export type StepFunction = (input: any, bindings: Record<string, any>) => StepOutput

export type Binding = {
  // exported value's name in bindings
  // if not specified then all paths will be exported
  name?: string
  // the file from which the export has to be looked at
  // defaults to bindings.js
  path?: string
  // Export all when name specified
  exportAll?: true
}

export type StepCommon = {
  name: string
  description?: string
  condition?: string
  inputTemplate?: string
  loopOverInput?: boolean
  onComplete?: StepExitAction
  onError?: StepExitAction
}

export type SimpleStep = StepCommon & {
  // One of the template, templatePath, externalWorkflowPath, Function are required for simple steps
  template?: string
  templatePath?: string
  // external workflow is executed independently and we can access only final output
  externalWorkflow?: {
    path: string,
    // root path for resolving dependencies
    rootPath?: string
  }
  // Function must be passed using bindings
  functionName?: string
}
export type WorkflowStep = StepCommon & {
  bindings?: Binding[]
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowPath are required for workflow steps
  steps?: SimpleStep[]
  workflowPath?: string
}

export type StepInternalCommon = {
  type?: StepType
  conditionExpression?: jsonata.Expression
  inputTemplateExpression?: jsonata.Expression
}

export type SimpleStepInternal = SimpleStep & StepInternalCommon & {
  templateExpression?: jsonata.Expression
  externalWorkflowEngine?: WorkflowEngine
}

export type WorkflowStepInternal = WorkflowStep & StepInternalCommon & {
  bindingsInternal?: Record<string, any>
  steps?: SimpleStepInternal[]
}

export type Step = SimpleStep | WorkflowStep
export type StepInternal = SimpleStepInternal | WorkflowStepInternal

export type Workflow = {
  bindings?: Binding[]
  steps: Step[]
}

export type WorkflowInternal = {
  bindings?: Binding[]
  bindingsInternal?: Record<string, any>
  steps: StepInternal[]
}

export type WorkflowOutput = {
  output?: any,
  outputs?: Record<string, any>,
  status?: number,
  error?: any
}

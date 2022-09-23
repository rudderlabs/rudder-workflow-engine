import { readFileSync } from 'fs';
import jsonata from 'jsonata';
import { join } from 'path';
import { CustomError } from '../errors';
import {
  Dictionary,
  SimpleStep,
  SimpleStepInternal,
  StepExitAction,
  StepFunction,
  StepOutput,
  StepType,
  Workflow,
  WorkflowStepInternal,
} from '../types';
import { WorkflowUtils } from '../utils';
import { WorkflowEngine } from '../workflow';

export class SimpleStepExecutor implements SimpleStepInternal {
  name: string;
  rootPath: string;
  description?: string | undefined;
  type: StepType.Simple = StepType.Simple;
  conditionExpression?: jsonata.Expression | undefined;
  inputTemplateExpression?: jsonata.Expression | undefined;
  loopOverInput?: boolean | undefined;
  onComplete?: StepExitAction | undefined;
  onError?: StepExitAction | undefined;
  debug?: boolean | undefined;

  parent?: WorkflowStepInternal | undefined;
  templateExpression?: jsonata.Expression | undefined;
  externalWorkflowEngine?: WorkflowEngine | undefined;
  function?: StepFunction | undefined;

  constructor(step: SimpleStep, rootPath: string) {
    this.name = step.name;
    this.rootPath = rootPath;
    // step properties
    this.description = step.description;
    this.loopOverInput = step.loopOverInput;
    this.onComplete = step.onComplete;
    this.onError = step.onError;
    this.debug = step.debug;
  }

  init(step: SimpleStep, bindings: Record<string, any> = {}) {
    if (step.condition) {
      this.conditionExpression = jsonata(step.condition);
    }

    if (step.externalWorkflow) {
      const rootPath = step.externalWorkflow.rootPath || this.rootPath;
      const externalWorkflow = WorkflowUtils.createFromFilePath<Workflow>(
        join(rootPath, step.externalWorkflow.path),
      );
      const externalWorkflowRootPath = join(rootPath, step.externalWorkflow.rootPath || '');
      this.externalWorkflowEngine = new WorkflowEngine(externalWorkflow, externalWorkflowRootPath);
    }

    if (step.templatePath) {
      step.template = readFileSync(join(this.rootPath, step.templatePath), 'utf-8');
    }

    if (step.template) {
      this.templateExpression = jsonata(step.template);
    }

    if (step.functionName) {
      this.function = bindings[step.functionName];
      if (typeof this.function !== 'function') {
        throw new CustomError('Invalid functionName', 400, step.name);
      }
    }
  }

  async execute(input: any, bindings: Dictionary<any>): Promise<StepOutput> {
    if (WorkflowUtils.shouldSkipStep(this, input, bindings)) {
      return { skipped: true };
    }
    bindings.context = bindings.context || {};
    const allBindings = Object.assign(
      {},
      // This is already being done from workflow.ts's "executeStepInternal" method
      // but should we do this again ?
      // this.workflow.bindingsInternal,
      bindings,
      WorkflowUtils.getContextFunctions(bindings.context),
    );

    if (this.externalWorkflowEngine) {
      return this.externalWorkflowEngine.execute(input, { context: bindings.context });
    }

    if (this.function) {
      return this.function(input, allBindings);
    }

    if (this.templateExpression) {
      const tempExprOut = await WorkflowUtils.jsonataPromise(
        this.templateExpression,
        input,
        allBindings,
      );
      return {
        output: tempExprOut,
      };
    }
    throw new CustomError('Invalid simple step configuration', 500, this.name);
  }
  validate() {}
}

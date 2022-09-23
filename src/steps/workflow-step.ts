import jsonata, { Expression } from 'jsonata';
import { join } from 'path';
import {
  Dictionary,
  SimpleStepInternal,
  StepExitAction,
  StepOutput,
  StepType,
  WorkflowStep,
  WorkflowStepInternal,
} from '../types';
import { WorkflowUtils } from '../utils';

export class WorkflowStepExecutor implements WorkflowStepInternal {
  name: string;
  rootPath: string;
  description?: string | undefined;
  type: StepType.Workflow = StepType.Workflow;
  conditionExpression?: Expression | undefined;
  inputTemplateExpression?: Expression | undefined;
  loopOverInput?: boolean | undefined;
  onComplete?: StepExitAction | undefined;
  onError?: StepExitAction | undefined;
  debug?: boolean | undefined;

  constructor(stepName: string, rootPath: string) {
    this.name = stepName;
    this.rootPath = rootPath;
  }

  bindings?: Dictionary<any> | undefined;
  steps?: SimpleStepInternal[] | undefined;

  init(step: WorkflowStep, _bindings: Dictionary<any> = {}) {
    if (step.condition) {
      this.conditionExpression = jsonata(step.condition);
    }
    if (step.workflowStepPath) {
      const fullPath = join(this.rootPath, step.workflowStepPath);
      const newWorkflowStep = WorkflowUtils.createFromFilePath<WorkflowStepInternal>(fullPath);
      this.bindings = Object.assign({}, newWorkflowStep.bindings, step.bindings);
      step.steps = newWorkflowStep.steps;
    }
    if (step.steps) {
      this.steps = step.steps.map((simpleStep) => {
        const simpleStepInternal = WorkflowUtils.getStepInternal({
          step: simpleStep,
          stepType: StepType.Simple,
          rootPath: this.rootPath,
          bindings: step.bindings,
        });
        return simpleStepInternal as SimpleStepInternal;
      });
    }
  }

  validate() {}

  async execute(input: any, bindings: Dictionary<any>): Promise<StepOutput> {
    if (WorkflowUtils.shouldSkipStep(this, input, this.bindings)) {
      return { skipped: true };
    }
    bindings.outputs[this.name] = {};
    let finalOutput: any;
    for (const simpleStep of this.steps as SimpleStepInternal[]) {
      const allBindings = Object.assign({}, this.bindings, bindings);
      const { skipped, output } = await simpleStep.execute(input, allBindings);
      if (!skipped) {
        bindings.outputs[this.name][simpleStep.name] = output;
        finalOutput = output;
      }
    }

    return { outputs: bindings.outputs[this.name], output: finalOutput };
  }
}

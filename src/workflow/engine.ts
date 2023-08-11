import { StepExecutor } from '../steps/types';
import { Executor } from '../common';
import { WorkflowStepExecutor } from '../steps';
import { WorkflowExecutor, WorkflowOutput } from './types';

export class WorkflowEngine implements Executor {
  readonly name: string;
  readonly bindings: Record<string, any>;
  readonly stepExecutors: StepExecutor[];
  private readonly executor: WorkflowExecutor;

  constructor(
    name: string,
    executor: WorkflowExecutor,
    bindings: Record<string, any>,
    stepExecutors: StepExecutor[],
  ) {
    this.bindings = bindings;
    this.name = name;
    this.stepExecutors = stepExecutors;
    this.executor = executor;
  }

  getStepExecutor(stepName: string, childStepName?: string): StepExecutor {
    let stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === stepName,
    );

    if (!stepExecutor) {
      throw new Error(`${stepName} was not found`);
    }

    if (childStepName) {
      const baseExecutor = stepExecutor.getBaseExecutor();
      if (baseExecutor instanceof WorkflowStepExecutor) {
        return baseExecutor.getStepExecutor(childStepName);
      }
      throw new Error(`${stepName} is not a workflow step`);
    }

    return stepExecutor;
  }

  async execute(input: any): Promise<WorkflowOutput> {
    return this.executor.execute(this, input);
  }
}

import { StepExecutor } from '../steps/types';
import { ErrorUtils, Executor } from '../common';
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

  getStepExecutor(stepName: string): StepExecutor {
    const stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === stepName,
    );

    if (!stepExecutor) {
      throw new Error(`${stepName} was not found`);
    }

    return stepExecutor;
  }

  async execute(input: any, executionBindings?: Record<string, any>): Promise<WorkflowOutput> {
    try {
      return await this.executor.execute(this, input, executionBindings);
    } catch (error: any) {
      throw ErrorUtils.createWorkflowExecutionError(error, this.name);
    }
  }
}

import { StepExecutor, WorkflowEngine, WorkflowExecutor, WorkflowOutput } from '../common';
import { ErrorUtils } from '../errors';

export class DefaultWorkflowEngine implements WorkflowEngine {
  private readonly name: string;

  private readonly bindings: Record<string, any>;

  private readonly stepExecutors: StepExecutor[];

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

  getName(): string {
    return this.name;
  }

  getBindings(): Record<string, any> {
    return this.bindings;
  }

  getStepExecutors(): StepExecutor[] {
    return this.stepExecutors;
  }

  getStepExecutor(stepName: string): StepExecutor {
    const stepExecutor = this.stepExecutors.find((executor) => executor.getStepName() === stepName);

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

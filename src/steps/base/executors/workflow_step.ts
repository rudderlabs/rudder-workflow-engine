import { Logger } from 'pino';
import { ExecutionBindings, Workflow } from '../../../workflow/types';
import { Dictionary, ErrorUtils } from '../../../common/';
import { BaseStepExecutor } from './base';
import { StepExecutor, StepExitAction, StepOutput, WorkflowStep } from '../../types';
export class WorkflowStepExecutor extends BaseStepExecutor {
  private readonly stepExecutors: StepExecutor[];
  constructor(
    workflow: Workflow,
    stepExecutors: StepExecutor[],
    step: WorkflowStep,
    bindings: Dictionary<any>,
    logger: Logger,
  ) {
    super(workflow, step, bindings, logger);
    this.stepExecutors = stepExecutors;
  }

  getStepExecutor(childStepName: string): StepExecutor {
    const stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === childStepName,
    );
    if (!stepExecutor) {
      throw new Error(`${this.getStepName()}:${childStepName} was not found`);
    }
    return stepExecutor;
  }

  async executeChildStep(
    childExector: StepExecutor,
    input: any,
    executionBindings: ExecutionBindings,
  ) {
    try {
      return await childExector.execute(input, executionBindings);
    } catch (error: any) {
      throw ErrorUtils.createStepExecutionError(
        error.error,
        this.getStepName(),
        childExector.getStepName(),
      );
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const workflowStepName = this.getStepName();
    executionBindings.outputs[workflowStepName] = {};
    let finalOutput: any;
    for (const childExecutor of this.stepExecutors) {
      const childStep = childExecutor.getStep();
      const { skipped, output } = await this.executeChildStep(
        childExecutor,
        input,
        executionBindings,
      );
      if (skipped) {
        continue;
      }
      executionBindings.outputs[workflowStepName][childExecutor.getStepName()] = output;
      finalOutput = output;
      if (childStep.onComplete === StepExitAction.Return) {
        break;
      }
    }
    return { outputs: executionBindings.outputs[workflowStepName], output: finalOutput };
  }
}

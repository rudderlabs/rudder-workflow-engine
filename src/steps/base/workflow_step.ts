import { join } from 'path';
import { Logger } from 'pino';
import { StepCreationError } from '../errors';
import { Dictionary, ExecutionBindings } from '../../types';
import { WorkflowUtils } from '../../utils';
import { BaseStepExecutor } from './base_executor';
import { StepExecutorFactory } from '../factory';
import { StepExecutor, StepOutput, StepType, WorkflowStep } from '../types';

export class WorkflowStepExecutor extends BaseStepExecutor {
  private readonly stepExecutors: StepExecutor[];
  constructor(
    stepExecutors: StepExecutor[],
    step: WorkflowStep,
    bindings: Dictionary<any>,
    logger: Logger,
  ) {
    super(step, bindings, logger);
    this.stepExecutors = stepExecutors;
  }

  getStepExecutor(stepName: string): StepExecutor | undefined {
    return this.stepExecutors.find((stepExecutor) => stepExecutor.getStepName() === stepName);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    executionBindings.outputs[this.getStepName()] = {};
    let finalOutput: any;
    for (const simpleStepExecutor of this.stepExecutors) {
      const { skipped, output } = await simpleStepExecutor.execute(input, executionBindings);
      if (!skipped) {
        executionBindings.outputs[this.getStepName()][simpleStepExecutor.getStepName()] = output;
        finalOutput = output;
      }
    }
    return { outputs: executionBindings.outputs[this.step.name], output: finalOutput };
  }
}

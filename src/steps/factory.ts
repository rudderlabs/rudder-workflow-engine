import { ComposableExecutorFactory } from './composed';
import { Step, StepExecutor } from './types';
import { BaseStepExecutorFactory } from './base/factory';
import { StepCreationError } from './errors';
import { WorkflowOptionsInternal } from 'src/workflow';

export class StepExecutorFactory {
  static async create(step: Step, options: WorkflowOptionsInternal): Promise<StepExecutor> {
    try {
      let stepExecutor: StepExecutor = await BaseStepExecutorFactory.create(step, options);
      stepExecutor = await ComposableExecutorFactory.create(stepExecutor, options);
      return stepExecutor;
    } catch (error: any) {
      if (error instanceof StepCreationError) {
        throw error;
      }
      throw new StepCreationError(error.message, step.name);
    }
  }
}

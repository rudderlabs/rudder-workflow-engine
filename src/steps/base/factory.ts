import { StepCreationError } from '../errors';
import { BatchExecutor, BatchStep, Step, StepExecutor, StepType, WorkflowStep } from '../types';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { BaseStepUtils } from './utils';
import { WorkflowOptionsInternal } from 'src/workflow';
import { BatchStepExecutor } from './batch/step_executor';

export class BaseStepExecutorFactory {
  static create(step: Step, options: WorkflowOptionsInternal): Promise<StepExecutor> {
    if (step.type === StepType.Simple) {
      return SimpleStepExecutorFactory.create(step, options);
    } else if (step.type === StepType.Workflow) {
      return this.createWorkflowStepExecutor(step, options);
    } else {
      return this.createBatchStepExecutor(step, options);
    }
  }
  static async createBatchStepExecutor(step: BatchStep, options: WorkflowOptionsInternal): Promise<BatchStepExecutor> {
    if (step.executor) {
      const executor = options.currentBindings[step.executor] as BatchExecutor;
      if (!executor?.execute) {
        throw new StepCreationError(`Invalid batch executor: ${step.executor}`, step.name);
      }
    }
    return new BatchStepExecutor(step, options.currentBindings);
  }

  static async createWorkflowStepExecutor(
    step: WorkflowStep,
    options: WorkflowOptionsInternal,
  ): Promise<WorkflowStepExecutor> {
    try {
      let newStep = await BaseStepUtils.prepareWorkflowStep(step, options);
      let simpleStepExecutors = await BaseStepUtils.createSimpleStepExecutors(newStep, options);
      return new WorkflowStepExecutor(newStep, simpleStepExecutors);
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name, error.stepName);
    }
  }


}

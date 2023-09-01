import { StepCreationError } from '../errors';
import { Step, StepExecutor, StepType, WorkflowStep } from '../types';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { BaseStepUtils } from './utils';
import { WorkflowOptionsInternal } from 'src/workflow';
import { BatchStepExecutorFactory } from './batch/factory';

export class BaseStepExecutorFactory {
  static create(step: Step, options: WorkflowOptionsInternal): Promise<StepExecutor> {
    if (step.type === StepType.Simple) {
      return SimpleStepExecutorFactory.create(step, options);
    } else if (step.type === StepType.Workflow) {
      return this.createWorkflowStepExecutor(step, options);
    } else {
      return BatchStepExecutorFactory.create(step, options);
    }
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

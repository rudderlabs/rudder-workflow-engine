import { Logger } from 'pino';
import { StepCreationError } from '../errors';
import { Dictionary } from '../../common/types';
import { Step, StepExecutor, StepType, WorkflowStep } from '../types';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { WorkflowUtils } from '../../workflow/utils';
import { BaseStepUtils } from './utils';

export class BaseStepExecutorFactory {
  static create(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<StepExecutor> {
    if (step.type == StepType.Simple) {
      return SimpleStepExecutorFactory.create(step, rootPath, bindings, parentLogger);
    } else {
      return this.createWorkflowStepExecutor(step, rootPath, bindings, parentLogger);
    }
  }

  static async createWorkflowStepExecutor(
    step: WorkflowStep,
    rootPath: string,
    workflowBindings: Dictionary<any>,
    logger: Logger,
  ): Promise<WorkflowStepExecutor> {
    try {
      let workflowStepLogger = logger.child({ workflow: step.name });
      let newStep = await BaseStepUtils.prepareWorkflowStep(step, rootPath);
      let workflowStepBindings = Object.assign(
        {},
        workflowBindings,
        await WorkflowUtils.extractBindings(rootPath, newStep.bindings),
      );

      let simpleStepExecutors = await BaseStepUtils.createSimpleStepExecutors(
        newStep,
        rootPath,
        workflowStepBindings,
        workflowStepLogger,
      );

      return new WorkflowStepExecutor(
        simpleStepExecutors,
        step,
        workflowStepBindings,
        workflowStepLogger,
      );
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name, error.stepName);
    }
  }
}

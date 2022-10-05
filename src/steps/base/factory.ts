import { Logger } from 'pino';
import { StepCreationError } from '../errors';
import { Dictionary } from '../../types';
import { Step, StepType, WorkflowStep } from '../types';
import { BaseStepExecutor } from './base_executor';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './workflow_step';
import { WorkflowUtils } from '../../utils';
import { BaseStepUtils } from './utils';

export class BaseStepExecutorFactory {
  static create(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
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
      let newStep = await BaseStepUtils.populateWorkflowStep(step, rootPath);
      BaseStepUtils.validateWorkflowStep(newStep);
      let workflowStepBindings = Object.assign({}, workflowBindings,
        await WorkflowUtils.extractBindings(rootPath, newStep.bindings));

      let simpleStepExecutors = await BaseStepUtils.createSimpleStepExecutors(
        newStep, rootPath, workflowStepBindings, workflowStepLogger);

      return new WorkflowStepExecutor(simpleStepExecutors, step,
        workflowStepBindings, workflowStepLogger);
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name, error.stepName);
    }
  }
}

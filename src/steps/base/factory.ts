import { Logger } from 'pino';
import { StepCreationError } from '../errors';
import { Dictionary } from '../../types';
import { Step, StepType, WorkflowStep } from '../types';
import { BaseStepExecutor } from './base_executor';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './workflow_step';
import { StepUtils } from '../utils';
import { WorkflowUtils } from '../../utils';
import { BaseStepUtils } from './utils';

export class BaseStepExecutorFactory {
  static create(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): BaseStepExecutor {
    switch (step.type || StepUtils.getStepType(step)) {
      case StepType.Simple:
        return SimpleStepExecutorFactory.create(step, rootPath, bindings, parentLogger);
      case StepType.Workflow:
        return this.createWorkflowStepExecutor(step, rootPath, bindings, parentLogger);
      default:
        throw new StepCreationError('Invalid step type', step.name);
    }
  }

  static createAsync(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
    switch (step.type || StepUtils.getStepType(step)) {
      case StepType.Simple:
        return SimpleStepExecutorFactory.createAsync(step, rootPath, bindings, parentLogger);
      case StepType.Workflow:
        return this.createWorkflowStepExecutorAsync(step, rootPath, bindings, parentLogger);
      default:
        throw new StepCreationError('Invalid step type', step.name);
    }
  }

  static createWorkflowStepExecutor(
    step: WorkflowStep,
    rootPath: string,
    workflowBindings: Dictionary<any>,
    logger: Logger,
  ): WorkflowStepExecutor {
    let workflowStepLogger = logger.child({ workflow: step.name });
    let newStep = BaseStepUtils.populateWorkflowStep(step, rootPath);
    if (!newStep.steps?.length) {
      throw new StepCreationError('Invalid workflow step configuration', step.name);
    }
    let workflowStepBindings = Object.assign(
      {},
      workflowBindings,
      WorkflowUtils.extractBindings(rootPath, newStep.bindings),
    );
    let simpleStepExecutors = BaseStepUtils.createSimpleStepExecutors(
      newStep.steps,
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
  }

  static async createWorkflowStepExecutorAsync(
    step: WorkflowStep,
    rootPath: string,
    workflowBindings: Dictionary<any>,
    logger: Logger,
  ): Promise<WorkflowStepExecutor> {
    let workflowStepLogger = logger.child({ workflow: step.name });
    let newStep = BaseStepUtils.populateWorkflowStep(step, rootPath);
    if (!newStep.steps?.length) {
      throw new StepCreationError('Invalid workflow step configuration', step.name);
    }
    let workflowStepBindings = Object.assign(
      {},
      workflowBindings,
      WorkflowUtils.extractBindings(rootPath, newStep.bindings),
    );
    let simpleStepExecutors = BaseStepUtils.createSimpleStepExecutors(
      newStep.steps,
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
  }
}

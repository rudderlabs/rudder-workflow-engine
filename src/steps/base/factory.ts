import { Logger } from 'pino';
import { WorkflowEngineError } from '../../errors';
import { Dictionary } from '../../types';
import { WorkflowUtils } from '../../utils';
import { Step, StepType, WorkflowStep } from '../types';
import { BaseStepExecutor } from './base_executor';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './workflow_step';

export class BaseStepExecutorFactory {
  static create(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): BaseStepExecutor {
    switch (step.type || WorkflowUtils.getStepType(step)) {
      case StepType.Simple:
        return SimpleStepExecutorFactory.create(step, rootPath, bindings, parentLogger);
      case StepType.Workflow:
        return new WorkflowStepExecutor(step as WorkflowStep, rootPath, bindings, parentLogger);
      default:
        throw new WorkflowEngineError('Invalid step type', 400, step.name);
    }
  }
}

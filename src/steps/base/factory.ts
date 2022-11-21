import { Logger } from 'pino';
import { StepCreationError } from '../errors';
import { Dictionary } from '../../common/types';
import { Step, StepExecutor, StepType, WorkflowStep } from '../types';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { WorkflowUtils } from '../../workflow/utils';
import { BaseStepUtils } from './utils';
import { Workflow } from 'src/workflow';

export class BaseStepExecutorFactory {
  static create(
    workflow: Workflow,
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<StepExecutor> {
    if (step.type == StepType.Simple) {
      return SimpleStepExecutorFactory.create(workflow, step, rootPath, bindings, parentLogger);
    } else {
      return this.createWorkflowStepExecutor(workflow, step, rootPath, bindings, parentLogger);
    }
  }

  static async createWorkflowStepExecutor(
    workflow: Workflow,
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
        workflow,
        newStep,
        rootPath,
        workflowStepBindings,
        workflowStepLogger,
      );

      return new WorkflowStepExecutor(
        workflow,
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

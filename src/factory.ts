import { Binding, Dictionary, Workflow } from './types';
import { WorkflowUtils } from './utils';
import * as libraryBindings from './bindings';
import { WorkflowCreationError } from './errors';
import { StepCreationError } from './steps/errors';
import { WorkflowEngine } from './workflow';
import { Step, StepExecutor, StepExecutorFactory } from './steps';
import { getLogger } from './logger';
import { Logger } from 'pino';

export class WorkflowEngineFactory {
  static create(workflow: Workflow, rootPath: string, bindingsPaths?: string[]): WorkflowEngine {
    try {
      WorkflowUtils.validateWorkflow(workflow);
      WorkflowUtils.populateStepType(workflow);
      const bindings = this.prepareBindings(rootPath, workflow.bindings, bindingsPaths);
      const logger = getLogger(workflow.name);
      const stepExecutors = this.createStepExecutors(workflow.steps, rootPath, bindings, logger);
      return new WorkflowEngine(workflow.name, logger, stepExecutors);
    } catch (error: any) {
      if (error instanceof StepCreationError) {
        throw new WorkflowCreationError(error.message, workflow.name, error.stepName);
      }
      if (error instanceof WorkflowCreationError) {
        throw error;
      }
      throw new WorkflowCreationError(error.message, workflow.name);
    }
  }

  static createFromFilePath(
    workflowPath: string,
    rootPath: string,
    bindingsPaths?: string[],
  ): WorkflowEngine {
    const workflow = WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    return this.create(workflow, rootPath, bindingsPaths);
  }

  private static prepareBindings(
    rootPath: string,
    workflowBindings?: Binding[],
    bindingsPaths?: string[],
  ) {
    return Object.assign(
      {},
      libraryBindings,
      WorkflowUtils.extractBindingsFromPaths(rootPath, bindingsPaths),
      WorkflowUtils.extractBindings(rootPath, workflowBindings),
    );
  }

  private static createStepExecutors(
    steps: Step[],
    rootPath: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): StepExecutor[] {
    return steps.map((step) => StepExecutorFactory.create(step, rootPath, bindings, logger));
  }
}

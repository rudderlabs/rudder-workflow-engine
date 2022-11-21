import { Dictionary } from '../common/types';
import { WorkflowUtils } from './utils';
import * as libraryBindings from '../bindings';
import { WorkflowCreationError } from './errors';
import { StepCreationError } from '../steps/errors';
import { WorkflowEngine } from './engine';
import { StepExecutor, StepExecutorFactory, StepType, StepUtils } from '../steps';
import { getLogger } from '../common/logger';
import { Logger } from 'pino';
import { Binding, Workflow, WorkflowOptions } from './types';

export class WorkflowEngineFactory {
  private static prepareWorkflow(workflow: Workflow, options?: WorkflowOptions) {
    WorkflowUtils.validateWorkflow(workflow);
    workflow.options = Object.assign({}, options, workflow.options);
    StepUtils.populateSteps(workflow.steps);
    StepUtils.validateSteps(workflow.steps, [StepType.Simple, StepType.Workflow]);
  }

  static async create(
    workflow: Workflow,
    rootPath: string,
    options?: WorkflowOptions,
  ): Promise<WorkflowEngine> {
    try {
      this.prepareWorkflow(workflow, options);
      const bindings = await this.prepareBindings(
        rootPath,
        workflow.bindings,
        options?.bindingsPaths,
      );
      const logger = getLogger(workflow.name);
      const stepExecutors = await this.createStepExecutors(workflow, rootPath, bindings, logger);
      return new WorkflowEngine(workflow, logger, stepExecutors);
    } catch (error: any) {
      if (error instanceof WorkflowCreationError) {
        throw error;
      }

      if (error instanceof StepCreationError) {
        throw new WorkflowCreationError(
          error.message,
          workflow.name,
          error.stepName,
          error.childStepName,
        );
      }

      throw new WorkflowCreationError(error.message, workflow.name);
    }
  }

  static async createFromFilePath(
    workflowPath: string,
    rootPath: string,
    options?: WorkflowOptions,
  ): Promise<WorkflowEngine> {
    const workflow = await WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    return this.create(workflow, rootPath, options);
  }

  private static async prepareBindings(
    rootPath: string,
    workflowBindings?: Binding[],
    bindingsPaths?: string[],
  ): Promise<Dictionary<any>> {
    return Object.assign(
      {},
      libraryBindings,
      await WorkflowUtils.extractBindingsFromPaths(rootPath, bindingsPaths),
      await WorkflowUtils.extractBindings(rootPath, workflowBindings),
    );
  }

  private static createStepExecutors(
    workflow: Workflow,
    rootPath: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): Promise<StepExecutor[]> {
    return Promise.all(
      workflow.steps.map((step) =>
        StepExecutorFactory.create(workflow, step, rootPath, bindings, logger),
      ),
    );
  }
}

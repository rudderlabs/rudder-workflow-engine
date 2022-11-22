import { Logger } from 'pino';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { Dictionary } from '../../../common/types';
import { ExternalWorkflow, SimpleStep } from '../../types';
import { FunctionStepExecutor } from './executors/function';
import { WorkflowEngineFactory, Workflow } from '../../../workflow';
import { BaseStepExecutor } from '../executors';
import { ExternalWorkflowStepExecutor } from './executors';
import { TemplateStepExecutorFactory } from './executors/template';

export class SimpleStepExecutorFactory {
  static async create(
    workflow: Workflow,
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      return this.createExternalWorkflowEngineExecutor(
        workflow,
        step,
        rootPath,
        bindings,
        simpleStepLogger,
      );
    }

    if (step.functionName) {
      return new FunctionStepExecutor(workflow, step, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = await this.extractTemplate(rootPath, step.templatePath);
    }

    return TemplateStepExecutorFactory.create(
      workflow,
      step,
      step.template as string,
      bindings,
      simpleStepLogger,
    );
  }

  private static extractTemplate(rootPath: string, templatePath: string): Promise<string> {
    return readFile(join(rootPath, templatePath), { encoding: 'utf-8' });
  }

  private static async createExternalWorkflowEngineExecutor(
    workflow: Workflow,
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<ExternalWorkflowStepExecutor> {
    const externalWorkflow = step.externalWorkflow as ExternalWorkflow;
    const workflowPath = join(rootPath, externalWorkflow.path);
    const externalWorkflowRootPath = join(rootPath, externalWorkflow.rootPath || '');
    const workflowEngine = await WorkflowEngineFactory.createFromFilePath(
      workflowPath,
      externalWorkflowRootPath,
      Object.assign({}, workflow.options, externalWorkflow.options),
    );
    return new ExternalWorkflowStepExecutor(workflow, workflowEngine, step, bindings, parentLogger);
  }
}

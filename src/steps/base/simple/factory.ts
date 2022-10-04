import { Logger } from 'pino';
import { join } from 'path';
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { StepCreationError } from '../../errors';
import { Dictionary } from '../../../types';
import { ExternalWorkflow, SimpleStep } from '../../types';
import { BaseStepExecutor } from '../base_executor';
import { ExternalWorkflowStepExecutor } from './external_workflow_executor';
import { FunctionStepExecutor } from './function_executor';
import { TemplateStepExecutor } from './template_executor';
import { WorkflowEngineFactory } from '../../../factory';
import { WorkflowUtils } from '../../../utils';
import { WorkflowEngine } from '../../../workflow';

export class SimpleStepExecutorFactory {
  static create(
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): BaseStepExecutor {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      const workflowEngine = this.createExternalWorkflowEngine(rootPath, step.externalWorkflow);
      return new ExternalWorkflowStepExecutor(workflowEngine, step, bindings, simpleStepLogger);
    }

    if (step.functionName) {
      return new FunctionStepExecutor(step, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = this.extractTemplate(rootPath, step.templatePath);
    }

    if (step.template) {
      return new TemplateStepExecutor(step.template, step, bindings, simpleStepLogger);
    }

    throw new StepCreationError('Invalid simple step configuration', step.name);
  }

  static async createAsync(
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      const workflowEngine = await this.createExternalWorkflowEngineAsync(
        rootPath,
        step.externalWorkflow,
      );
      return new ExternalWorkflowStepExecutor(workflowEngine, step, bindings, simpleStepLogger);
    }

    if (step.functionName) {
      return new FunctionStepExecutor(step, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = await this.extractTemplateAsync(rootPath, step.templatePath);
    }

    if (step.template) {
      return new TemplateStepExecutor(step.template, step, bindings, simpleStepLogger);
    }

    throw new StepCreationError('Invalid simple step configuration', step.name);
  }

  private static createExternalWorkflowEngine(
    rootPath: string,
    externalWorkflow: ExternalWorkflow,
  ): WorkflowEngine {
    const workflowPath = join(rootPath, externalWorkflow.path);
    const workflow = WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    const externalWorkflowRootPath = join(rootPath, externalWorkflow.rootPath || '');
    return WorkflowEngineFactory.create(
      workflow,
      externalWorkflowRootPath,
      externalWorkflow.bindingPaths,
    );
  }

  private static async createExternalWorkflowEngineAsync(
    rootPath: string,
    externalWorkflow: ExternalWorkflow,
  ): Promise<WorkflowEngine> {
    const workflowPath = join(rootPath, externalWorkflow.path);
    const workflow = await WorkflowUtils.createWorkflowFromFilePathAsync(workflowPath);
    const externalWorkflowRootPath = join(rootPath, externalWorkflow.rootPath || '');
    return WorkflowEngineFactory.create(
      workflow,
      externalWorkflowRootPath,
      externalWorkflow.bindingPaths,
    );
  }

  private static extractTemplate(rootPath: string, templatePath: string): string {
    return readFileSync(join(rootPath, templatePath), { encoding: 'utf-8' });
  }

  private static extractTemplateAsync(rootPath: string, templatePath: string): Promise<string> {
    return readFile(join(rootPath, templatePath), { encoding: 'utf-8' });
  }
}

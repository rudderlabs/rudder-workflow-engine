import { Logger } from 'pino';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { StepCreationError } from '../../errors';
import { Dictionary } from '../../../types';
import { ExternalWorkflow, SimpleStep, StepFunction } from '../../types';
import { BaseStepExecutor } from '../base_executor';
import { ExternalWorkflowStepExecutor } from './external_workflow_executor';
import { FunctionStepExecutor } from './function_executor';
import { TemplateStepExecutor } from './template_executor';
import { WorkflowEngineFactory } from '../../../factory';
import { WorkflowUtils } from '../../../utils';
import { WorkflowEngine } from '../../../workflow';

export class SimpleStepExecutorFactory {
  static async create(
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      const workflowEngine = await this.createExternalWorkflowEngine(
        rootPath,
        step.externalWorkflow,
      );
      return new ExternalWorkflowStepExecutor(workflowEngine, step, bindings, simpleStepLogger);
    }

    if (step.functionName) {
      const fn = this.exatractFunction(step.functionName, bindings, step.name);
      return new FunctionStepExecutor(fn, step, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = await this.extractTemplate(rootPath, step.templatePath);
    }

    return new TemplateStepExecutor(step.template as string, step, bindings, simpleStepLogger);
  }

  private static async createExternalWorkflowEngine(
    rootPath: string,
    externalWorkflow: ExternalWorkflow,
  ): Promise<WorkflowEngine> {
    const workflowPath = join(rootPath, externalWorkflow.path);
    const workflow = await WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    const externalWorkflowRootPath = join(rootPath, externalWorkflow.rootPath || '');
    return WorkflowEngineFactory.create(
      workflow,
      externalWorkflowRootPath,
      externalWorkflow.bindingPaths,
    );
  }

  private static exatractFunction(functionName: string, bindings: Dictionary<any>, stepName: string): StepFunction {
    if (typeof bindings[functionName] !== 'function') {
      throw new StepCreationError('Invalid functionName', stepName);
    }
    return bindings[functionName] as StepFunction;
  }

  private static extractTemplate(rootPath: string, templatePath: string): Promise<string> {
    return readFile(join(rootPath, templatePath), { encoding: 'utf-8' });
  }
}

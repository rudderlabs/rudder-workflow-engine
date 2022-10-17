import { Logger } from 'pino';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { StepCreationError } from '../../errors';
import { Dictionary } from '../../../common/types';
import { ExternalWorkflow, SimpleStep, StepFunction } from '../../types';
import { FunctionStepExecutor } from './executors/function';
import { TemplateStepExecutor } from './executors/template';
import { WorkflowUtils, WorkflowEngineFactory } from '../../../workflow';
import { BaseStepExecutor } from '../executors';
import { ExternalWorkflowStepExecutor } from './executors';

export class SimpleStepExecutorFactory {
  static async create(
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<BaseStepExecutor> {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      return this.createExternalWorkflowEngineExecutor(
        step.externalWorkflow,
        step,
        rootPath,
        bindings,
        simpleStepLogger,
      );
    }

    if (step.functionName) {
      const fn = this.extractFunction(step.functionName, bindings, step.name);
      return new FunctionStepExecutor(fn, step, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = await this.extractTemplate(rootPath, step.templatePath);
    }

    return new TemplateStepExecutor(step.template as string, step, bindings, simpleStepLogger);
  }

  private static extractFunction(
    functionName: string,
    bindings: Dictionary<any>,
    stepName: string,
  ): StepFunction {
    if (typeof bindings[functionName] !== 'function') {
      throw new StepCreationError(`Invalid functionName: ${functionName}`, stepName);
    }
    return bindings[functionName] as StepFunction;
  }

  private static extractTemplate(rootPath: string, templatePath: string): Promise<string> {
    return readFile(join(rootPath, templatePath), { encoding: 'utf-8' });
  }

  private static async createExternalWorkflowEngineExecutor(
    externalWorkflow: ExternalWorkflow,
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<ExternalWorkflowStepExecutor> {
    const workflowPath = join(rootPath, externalWorkflow.path);
    const workflow = await WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    const externalWorkflowRootPath = join(rootPath, externalWorkflow.rootPath || '');
    const workflowEngine = await WorkflowEngineFactory.create(
      workflow,
      externalWorkflowRootPath,
      externalWorkflow.bindingPaths,
    );
    return new ExternalWorkflowStepExecutor(workflowEngine, step, bindings, parentLogger);
  }
}

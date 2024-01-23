import { join } from 'path';
import { ExternalWorkflow, SimpleStep } from '../../types';
import { FunctionStepExecutor } from './executors/function';
import { WorkflowEngineFactory, WorkflowUtils, WorkflowOptionsInternal } from '../../../workflow';
import { BaseStepExecutor } from '../executors';
import { ExternalWorkflowStepExecutor } from './executors';
import { TemplateStepExecutorFactory } from './executors/template';
import { CommonUtils } from '../../../common';

export class SimpleStepExecutorFactory {
  static async create(
    step: SimpleStep,
    options: WorkflowOptionsInternal,
  ): Promise<BaseStepExecutor> {
    if (step.externalWorkflow) {
      return this.createExternalWorkflowEngineExecutor(step, options);
    }

    if (step.functionName) {
      return new FunctionStepExecutor(step, options.currentBindings);
    }

    if (step.templatePath) {
      step.template = await this.extractTemplate(options.rootPath, step.templatePath);
    }

    return TemplateStepExecutorFactory.create(step, step.template as string, options);
  }

  private static extractTemplate(rootPath: string, templatePath: string): Promise<string> {
    return CommonUtils.readFile(join(rootPath, templatePath));
  }

  private static async createExternalWorkflowEngineExecutor(
    step: SimpleStep,
    options: WorkflowOptionsInternal,
  ): Promise<ExternalWorkflowStepExecutor> {
    const externalWorkflowConfig = step.externalWorkflow as ExternalWorkflow;
    const externalWorkflowPath = join(options.rootPath, externalWorkflowConfig.path);
    const externalWorkflowRootPath = join(options.rootPath, externalWorkflowConfig.rootPath || '');
    const externalWorkflow = await WorkflowUtils.createWorkflowFromFilePath(externalWorkflowPath);
    externalWorkflow.bindings = (externalWorkflow.bindings || []).concat(
      externalWorkflowConfig.bindings || [],
    );
    const externalWorkflowEngine = await WorkflowEngineFactory.create(externalWorkflow, {
      ...options,
      // @ts-expect-error: 2nd arg doesn't contain parentBindings field
      parentBindings: options.currentBindings,
      rootPath: externalWorkflowRootPath,
    });
    return new ExternalWorkflowStepExecutor(externalWorkflowEngine, step);
  }
}

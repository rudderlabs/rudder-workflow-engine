import { join } from 'path';
import { ExternalWorkflow, SimpleStep, WorkflowOptionsInternal } from '../../../common/types';
import { CommonUtils } from '../../../common/utils';
import { WorkflowEngineFactory, WorkflowUtils } from '../../../workflow';
import { BaseStepExecutor } from '../executors';
import { ExternalWorkflowStepExecutor } from './executors';
import { FunctionStepExecutor } from './executors/function';
import { TemplateStepExecutorFactory } from './executors/template';

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
      // eslint-disable-next-line no-param-reassign
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
      parentBindings: options.currentBindings,
      rootPath: externalWorkflowRootPath,
    });
    return new ExternalWorkflowStepExecutor(externalWorkflowEngine, step);
  }
}

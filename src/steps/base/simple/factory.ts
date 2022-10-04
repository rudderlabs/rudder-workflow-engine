import { Logger } from 'pino';
import { join } from 'path';
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
import { readFileSync } from 'fs';

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
      return new ExternalWorkflowStepExecutor(
        workflowEngine,
        step,
        rootPath,
        bindings,
        simpleStepLogger,
      );
    }

    if (step.functionName) {
      return new FunctionStepExecutor(step, rootPath, bindings, simpleStepLogger);
    }

    if (step.templatePath) {
      step.template = this.extractTemplate(rootPath, step.templatePath);
    }

    if (step.template) {
      return new TemplateStepExecutor(step.template, step, rootPath, bindings, simpleStepLogger);
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

  private static extractTemplate(rootPath: string, templatePath: string): string {
    return readFileSync(join(rootPath, templatePath), { encoding: 'utf-8' });
  }
}

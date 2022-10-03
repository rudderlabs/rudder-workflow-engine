import { Logger } from 'pino';
import { StepCreationError, WorkflowCreationError } from '../../../errors';
import { Dictionary } from '../../../types';
import { SimpleStep, StepExecutor } from '../../types';
import { BaseStepExecutor } from '../base_executor';
import { ExternalWorkflowStepExecutor } from './external_workflow_executor';
import { FunctionStepExecutor } from './function_executor';
import { TemplateStepExecutor } from './template_executor';

export class SimpleStepExecutorFactory {
  static create(
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): BaseStepExecutor {
    const simpleStepLogger = parentLogger.child({ step: step.name });
    if (step.externalWorkflow) {
      return new ExternalWorkflowStepExecutor(step, rootPath, bindings, simpleStepLogger);
    }

    if (step.functionName) {
      return new FunctionStepExecutor(step, rootPath, bindings, simpleStepLogger);
    }

    if (step.template || step.templatePath) {
      return new TemplateStepExecutor(step, rootPath, bindings, simpleStepLogger);
    }

    throw new StepCreationError('Invalid simple step configuration', step.name);
  }
}

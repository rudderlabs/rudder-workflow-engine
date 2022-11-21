import { Logger } from 'pino';
import { Dictionary } from '../../../../../common';
import { SimpleStep, TemplateStepExecutor, TemplateType } from '../../../../../steps/types';
import { Workflow } from '../../../../../workflow/types';
import { JsonataStepExecutor } from './jsonata';
import { JsonTemplateStepExecutor } from './jsontemplate';

export class TemplateStepExecutorFactory {
  static create(
    workflow: Workflow,
    step: SimpleStep,
    template: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): TemplateStepExecutor {
    if (workflow.options?.templateType === TemplateType.JSONATA) {
      return new JsonataStepExecutor(workflow, step, template, bindings, logger);
    }
    return new JsonTemplateStepExecutor(workflow, step, template, bindings, logger);
  }
}

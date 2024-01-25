import { SimpleStep, TemplateType, WorkflowOptionsInternal } from '../../../../../common';
import { TemplateStepExecutor } from '../../../../types';
import { JsonataStepExecutor } from './jsonata';
import { JsonTemplateStepExecutor } from './jsontemplate';

export class TemplateStepExecutorFactory {
  static create(
    step: SimpleStep,
    template: string,
    options: WorkflowOptionsInternal,
  ): TemplateStepExecutor {
    if (options.templateType === TemplateType.JSONATA) {
      return new JsonataStepExecutor(step, template);
    }
    return new JsonTemplateStepExecutor(step, template, options.currentBindings);
  }
}

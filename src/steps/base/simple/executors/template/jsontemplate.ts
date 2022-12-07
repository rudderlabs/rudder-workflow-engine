import { JsonTemplateEngine, PathType } from 'rudder-json-template-engine';
import { ExecutionBindings } from '../../../../../workflow/types';
import { BaseStepExecutor } from '../../../executors/base';
import { SimpleStep, StepOutput } from '../../../../types';

export class JsonTemplateStepExecutor extends BaseStepExecutor {
  private readonly templateEngine: JsonTemplateEngine;

  constructor(step: SimpleStep, template: string, bindings?: Record<string, any>) {
    super(step);
    this.templateEngine = JsonTemplateEngine.create(template, {
      compileTimeBindings: bindings,
      defaultPathType: PathType.SIMPLE,
    });
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const output = await this.templateEngine.evaluate(input, executionBindings);
    return { output };
  }
}

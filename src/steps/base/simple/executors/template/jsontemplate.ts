import { JsonTemplateEngine, PathType } from '@rudderstack/json-template-engine';
import { ExecutionBindings, Step, StepOutput } from '../../../../../common';
import { BaseStepExecutor } from '../../../executors/base';

export class JsonTemplateStepExecutor extends BaseStepExecutor {
  private readonly templateEngine: JsonTemplateEngine;

  constructor(step: Step, template: string, bindings?: Record<string, any>) {
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

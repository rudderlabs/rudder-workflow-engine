import {
  Expression,
  FlatMappingPaths,
  JsonTemplateEngine,
  PathType,
} from '@rudderstack/json-template-engine';
import { ExecutionBindings, SimpleStep, StepOutput } from '../../../../../common';
import { BaseStepExecutor } from '../../../executors/base';

export class JsonTemplateStepExecutor extends BaseStepExecutor {
  private readonly templateEngine: JsonTemplateEngine;

  static parse(template: string, mappings?: boolean, bindings?: Record<string, any>): Expression {
    if (mappings) {
      try {
        const mappingPaths = JSON.parse(template) as FlatMappingPaths[];
        return JsonTemplateEngine.parse(mappingPaths, { defaultPathType: PathType.JSON });
      } catch (e) {
        // parse as template
      }
    }
    return JsonTemplateEngine.parse(template, {
      defaultPathType: PathType.SIMPLE,
      compileTimeBindings: bindings,
    });
  }

  constructor(step: SimpleStep, template: string, bindings?: Record<string, any>) {
    super(step);
    const expression = JsonTemplateStepExecutor.parse(template, step.mappings, bindings);
    this.templateEngine = JsonTemplateEngine.create(expression, {
      compileTimeBindings: bindings,
      defaultPathType: PathType.SIMPLE,
    });
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const output = await this.templateEngine.evaluate(input, executionBindings);
    return { output };
  }
}

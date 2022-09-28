import { readFileSync } from 'fs';
import jsonata from 'jsonata';
import { join } from 'path';
import { Logger } from 'pino';
import { WorkflowUtils } from '../../../utils';
import { Dictionary, ExecutionBindings } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { SimpleStep, Step, StepOutput } from '../../types';
import { WorkflowEngineError } from '../../../errors';

export class TemplateStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonata.Expression;

  constructor(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, rootPath, bindings, parentLogger.child({ type: 'Template' }));
    this.templateExpression = this.prepareTemplateExpression(step);
  }

  private prepareTemplateExpression(step: SimpleStep): jsonata.Expression {
    if (step.templatePath) {
      const templatePath = join(this.rootPath, step.templatePath);
      step.template = readFileSync(templatePath, { encoding: 'utf-8' });
    }
    if (!step.template) {
      throw new WorkflowEngineError(
        'template or templatePath are required for TemplateStepExecutor',
        400,
        step.name,
      );
    }
    return jsonata(step.template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = Object.assign(
      {},
      this.bindings,
      executionBindings,
      this.getLoggerBindings(),
    );
    const output = await WorkflowUtils.jsonataPromise(this.templateExpression, input, allBindings);
    return { output };
  }
}

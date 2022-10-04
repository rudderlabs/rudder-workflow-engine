import jsonata from 'jsonata';
import { Logger } from 'pino';
import { WorkflowUtils } from '../../../utils';
import { Dictionary, ExecutionBindings } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { Step, StepOutput } from '../../types';

export class TemplateStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonata.Expression;

  constructor(template: string, step: Step, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, bindings, parentLogger.child({ type: 'Template' }));
    this.templateExpression = jsonata(template);
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

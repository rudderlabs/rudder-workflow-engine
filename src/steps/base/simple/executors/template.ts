import jsonataBeta from '../../../../external_dependencies/jsonata';
import { Logger } from 'pino';
import { WorkflowUtils } from '../../../../workflow/utils';
import { ExecutionBindings } from '../../../../workflow/types';
import { Dictionary } from '../../../../common/types';
import { BaseStepExecutor } from '../../executors/base';
import { Step, StepOutput } from '../../../types';

export class TemplateStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonataBeta.Expression;

  constructor(template: string, step: Step, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, bindings, parentLogger.child({ type: 'Template' }));
    this.templateExpression = jsonataBeta(template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = Object.assign(
      {},
      this.bindings,
      executionBindings,
      this.getLoggerBindings(),
    );
    const output = await WorkflowUtils.evaluateJsonataBetaExpr(
      this.templateExpression,
      input,
      allBindings,
    );
    return { output };
  }
}

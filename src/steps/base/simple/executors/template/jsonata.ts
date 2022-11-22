import jsonata from 'jsonata';
import { Logger } from 'pino';
import { WorkflowUtils } from '../../../../../workflow/utils';
import { ExecutionBindings, Workflow } from '../../../../../workflow/types';
import { Dictionary } from '../../../../../common/types';
import { BaseStepExecutor } from '../../../executors/base';
import { SimpleStep, StepOutput } from '../../../../types';

export class JsonataStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonata.Expression;

  constructor(
    workflow: Workflow,
    step: SimpleStep,
    template: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    super(workflow, step, bindings, parentLogger.child({ type: 'Jsonata' }));
    this.templateExpression = jsonata(template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = Object.assign(
      {},
      this.bindings,
      executionBindings,
      this.getLoggerBindings(),
    );
    const output = await WorkflowUtils.evaluateJsonataExpr(
      this.templateExpression,
      input,
      allBindings,
    );
    return { output };
  }
}

import { Logger } from 'pino';
import { JsonTemplateEngine } from 'rudder-json-template-engine';
import { ExecutionBindings, Workflow } from '../../../../../workflow/types';
import { Dictionary } from '../../../../../common/types';
import { BaseStepExecutor } from '../../../executors/base';
import { SimpleStep, StepOutput } from '../../../../types';

export class JsonTemplateStepExecutor extends BaseStepExecutor {
  private readonly templateEngine: JsonTemplateEngine;

  constructor(
    workflow: Workflow,
    step: SimpleStep,
    template: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    super(workflow, step, bindings, parentLogger.child({ type: 'JsonTemplate' }));
    this.templateEngine = new JsonTemplateEngine(template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = Object.assign(
      {},
      this.bindings,
      executionBindings,
      this.getLoggerBindings(),
    );
    const output = await this.templateEngine.evaluate(input, allBindings);
    return { output };
  }
}

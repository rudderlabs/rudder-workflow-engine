import jsonataBeta from '../../../external_dependencies/jsonata';
import { WorkflowUtils } from '../../../workflow/utils';
import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { Step, StepExecutor, StepOutput } from '../../types';

type CustomData = {
  input: any;
  context: any;
};

/**
 * CustomInputStepExecutor customizes the input, context the
 * and then invokes step executor with the custom data
 */
export class CustomDataStepExecutor extends ComposableStepExecutor {
  private readonly inputTemplateExpression?: jsonataBeta.Expression;
  private readonly contextTemplateExpression?: jsonataBeta.Expression;

  constructor(step: Step, nextExecutor: StepExecutor) {
    super(nextExecutor);
    if (step.inputTemplate) {
      this.inputTemplateExpression = jsonataBeta(step.inputTemplate);
    }
    if (step.contextTemplate) {
      this.contextTemplateExpression = jsonataBeta(step.contextTemplate);
    }
  }

  private async prepareData(input: any, executionBindings: ExecutionBindings): Promise<CustomData> {
    const allBindings = Object.assign({}, super.getBindings(), executionBindings);
    const customData: CustomData = { input, context: executionBindings.context };
    if (this.inputTemplateExpression) {
      customData.input = await WorkflowUtils.evaluateJsonataBetaExpr(
        this.inputTemplateExpression,
        input,
        allBindings,
      );
    }
    if (this.contextTemplateExpression) {
      customData.context = await WorkflowUtils.evaluateJsonataBetaExpr(
        this.contextTemplateExpression,
        input,
        allBindings,
      );
    }
    return customData;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const customData = await this.prepareData(input, executionBindings);
    const newExecutionBindings = { ...executionBindings, context: customData.context };
    return super.execute(customData.input, newExecutionBindings);
  }
}

import jsonata from 'jsonata';
import { ExecutionBindings, Step, StepOutput } from '../../../../../common';
import { ErrorUtils, StatusError } from '../../../../../errors';
import { BaseStepExecutor } from '../../../executors/base';

export class JsonataStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonata.Expression;

  constructor(step: Step, template: string) {
    super(step);
    this.templateExpression = jsonata(template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const output = await JsonataStepExecutor.evaluateJsonataExpr(
      this.templateExpression,
      input,
      executionBindings,
    );
    return { output: JsonataStepExecutor.cleanUpArrays(output) };
  }

  /**
   * JSONata adds custom properties to arrays for internal processing
   * hence it fails the comparison so we need to cleanup.
   * Reference: https://github.com/jsonata-js/jsonata/issues/296
   */
  private static cleanUpArrays(obj: any) {
    let newObj = obj;
    if (Array.isArray(obj)) {
      newObj = obj.map((val) => this.cleanUpArrays(val));
    } else if (newObj instanceof Object) {
      Object.keys(newObj).forEach((key) => {
        newObj[key] = this.cleanUpArrays(obj[key]);
      });
    }
    return newObj;
  }

  static async evaluateJsonataExpr(
    expr: jsonata.Expression,
    data: any,
    bindings: Record<string, any>,
  ): Promise<any> {
    try {
      return await expr.evaluate(data, bindings);
    } catch (error: any) {
      if (error.token === 'doReturn') {
        return error.result;
      }
      if (ErrorUtils.isAssertError(error)) {
        throw new StatusError(error.message, 400);
      }
      throw error;
    }
  }
}

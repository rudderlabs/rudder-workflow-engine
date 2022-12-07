import jsonata from 'jsonata';
import { ExecutionBindings } from '../../../../../workflow/types';
import { BaseStepExecutor } from '../../../executors/base';
import { SimpleStep, StepOutput } from '../../../../types';
import { ErrorUtils, StatusError } from '../../../../../common';

export class JsonataStepExecutor extends BaseStepExecutor {
  private readonly templateExpression: jsonata.Expression;

  constructor(step: SimpleStep, template: string) {
    super(step);
    this.templateExpression = jsonata(template);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const output = await JsonataStepExecutor.evaluateJsonataExpr(
      this.templateExpression,
      input,
      executionBindings,
    );
    return { output };
  }

  /**
   * JSONata adds custom properties to arrays for internal processing
   * hence it fails the comparison so we need to cleanup.
   * Reference: https://github.com/jsonata-js/jsonata/issues/296
   */
  private static cleanUpArrays(obj: any) {
    if (Array.isArray(obj)) {
      obj = obj.map((val) => this.cleanUpArrays(val));
    } else if (obj instanceof Object) {
      Object.keys(obj).forEach((key) => {
        obj[key] = this.cleanUpArrays(obj[key]);
      });
    }
    return obj;
  }

  static async evaluateJsonataExpr(
    expr: jsonata.Expression,
    data: any,
    bindings: Record<string, any>,
  ): Promise<any> {
    const output = await new Promise(function (resolve, reject) {
      expr.evaluate(data, bindings, function (error, response) {
        if (error) {
          if (error.token === 'doReturn') {
            return resolve((error as any).result);
          }
          if (ErrorUtils.isAssertError(error)) {
            return reject(new StatusError(error.message, 400));
          }
          return reject(error);
        }
        resolve(response);
      });
    });
    return this.cleanUpArrays(output);
  }
}

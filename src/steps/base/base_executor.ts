import { Logger } from 'pino';
import { Dictionary, ExecutionBindings } from '../../types';
import { Step, StepExecutor, StepOutput, StepType } from '../types';
import { StepUtils } from '../utils';

export abstract class BaseStepExecutor implements StepExecutor {
  protected readonly step: Step;
  private logger: Logger;
  protected readonly bindings: Dictionary<any>;

  constructor(step: Step, bindings: Dictionary<any>, logger: Logger) {
    this.step = step;
    this.logger = this.prepareLogger(logger);
    this.bindings = bindings;
  }

  getBindings(): Dictionary<any> {
    return this.bindings;
  }

  getStep(): Step {
    return this.step;
  }

  private prepareLogger(logger: Logger): Logger {
    if (this.step.debug) {
      logger.level = 'debug';
    }
    return logger;
  }

  getLoggerBindings() {
    return {
      log: console.log,
      debug: (message: string, ...args) => this.getLogger().debug(args, message),
      info: (message: string, ...args) => this.getLogger().info(args, message),
      warn: (message: string, ...args) => this.getLogger().warn(args, message),
      error: (message: string, ...args) => this.getLogger().error(args, message),
    };
  }

  getStepName(): string {
    return this.step.name;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getBaseExecutor(): BaseStepExecutor {
    return this;
  }

  abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}

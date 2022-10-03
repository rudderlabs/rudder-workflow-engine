import { Logger } from 'pino';
import { WorkflowUtils } from '../../utils';
import { Dictionary, ExecutionBindings } from '../../types';
import { Step, StepExecutor, StepOutput, StepType } from '../types';

export abstract class BaseStepExecutor implements StepExecutor {
  protected readonly step: Step;
  private logger: Logger;
  protected readonly rootPath: string;
  protected readonly bindings: Dictionary<any>;

  constructor(step: Step, rootPath: string, bindings: Dictionary<any>, logger: Logger) {
    this.rootPath = rootPath;
    this.step = step;
    this.logger = this.prepareLogger(logger);
    this.bindings = bindings;
  }

  getStepType(): StepType {
    return this.step.type || WorkflowUtils.getStepType(this.step);
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

  setLogger(logger?: Logger) {
    this.logger = logger || this.logger;
  }

  getLogger(): Logger {
    return this.logger;
  }

  abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}

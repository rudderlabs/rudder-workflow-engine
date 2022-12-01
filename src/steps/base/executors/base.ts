import { Logger } from 'pino';
import { ExecutionBindings, Workflow } from '../../../workflow/types';
import { Dictionary } from '../../../common/types';
import { Step, StepExecutor, StepOutput } from '../../types';
export abstract class BaseStepExecutor implements StepExecutor {
  protected readonly step: Step;
  protected readonly workflow: Workflow;
  private logger: Logger;
  protected readonly bindings: Dictionary<any>;

  constructor(workflow: Workflow, step: Step, bindings: Dictionary<any>, logger: Logger) {
    this.workflow = workflow;
    this.step = step;
    this.logger = this.prepareLogger(logger);
    this.bindings = Object.assign({}, this.getLoggerBindings(), bindings);
  }

  getWorkflow(): Workflow {
    return this.workflow;
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

  getAllExecutionBindings(executionBindings: ExecutionBindings): Dictionary<any> {
    return Object.assign({}, this.bindings, executionBindings);
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

import { Logger } from "pino";
import { WorkflowUtils } from "../../utils";
import { Dictionary, ExecutionBindings } from "../../types";
import { Step, StepExecutor, StepOutput, StepType } from "../types";

export abstract class BaseStepExector implements StepExecutor {
    protected readonly step: Step;
    protected readonly logger: Logger;
    protected readonly rootPath: string;
    protected readonly bindings: Dictionary<any>;

    constructor(step: Step, rootPath: string, bindings: Dictionary<any>, logger: Logger){
        this.rootPath = rootPath;
        this.step = step;
        this.bindings = bindings;
        this.logger = this.prepareLogger(logger);
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

    private prepareLogger(logger: Logger ): Logger {
        if (this.step.debug) {
            logger.level = "debug";
        }
        return logger;
    }

    getStepName(): string {
        return this.step.name;
    }

    getLogger(): Logger {
       return this.logger;
    }

    abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}
import jsonata from "jsonata";
import { Logger } from "pino";
import { Dictionary, ExecutionBindings, Step, StepOutput } from "../types";
import { WorkflowUtils } from "../utils";
import { StepExecutor } from "./interface";

export abstract class BaseExector implements StepExecutor {
    protected readonly step: Step;
    protected readonly logger: Logger;
    protected readonly rootPath: string;
    protected readonly bindings: Dictionary<any>;
    protected readonly conditionExpression?: jsonata.Expression;
    protected readonly inputTemplateExpression?: jsonata.Expression;

    constructor(step: Step, rootPath: string, bindings: Dictionary<any>, logger: Logger){
        this.rootPath = rootPath;
        this.step = step;
        this.bindings = bindings;
        this.logger = this.prepareLogger(logger);
        
        if(step.condition) {
            this.conditionExpression = jsonata(step.condition);
        }
        if(step.inputTemplate) {
            this.inputTemplateExpression = jsonata(step.inputTemplate);
        }
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

    async prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any> {
        if (this.inputTemplateExpression) {
            const allBindings = Object.assign({}, this.bindings, executionBindings);
            return WorkflowUtils.jsonataPromise(this.inputTemplateExpression, input, allBindings)
        }
        return input;
    }

    shouldSkip(input: any, executionBindings: ExecutionBindings): boolean {
        if (this.conditionExpression) {
            const allBindings = Object.assign({}, this.bindings, executionBindings);
            return !this.conditionExpression.evaluate(input, allBindings);
        }
        return false;
    }

    getStepName(): string {
        return this.step.name;
    }

    getLogger(): Logger {
       return this.logger;
    }
    abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}
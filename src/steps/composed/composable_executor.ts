import { Logger } from "pino";
import { Dictionary, ExecutionBindings } from "../../types";
import { Step, StepExecutor, StepOutput, StepType } from "../types";

/**
 * ComposableStepExecutor allows compose more logic
 * on top the given step executor.
 */
export class ComposableStepExecutor implements StepExecutor {
    protected logger: Logger;
    private stepExecutor: StepExecutor;

    constructor(name: string, stepExecutor: StepExecutor) {
        this.stepExecutor = stepExecutor;
        // Adding the name executor will be helpful in debugging.
        this.logger =  this.stepExecutor.getLogger().child({[name]: true})
    }
    
    getStepType(): StepType {
        return this.stepExecutor.getStepType();
    }

    getBindings(): Dictionary<any> {
        return this.stepExecutor.getBindings();
    }

    getLogger(): Logger {
        return this.logger;
    }

    getStep(): Step {
        return this.stepExecutor.getStep();
    }

    getStepName(): string {
        return this.stepExecutor.getStepName();
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        return this.stepExecutor.execute(input, executionBindings)
    }
}
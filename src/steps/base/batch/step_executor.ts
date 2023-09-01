import { BatchExecutor, BatchStep, StepOutput } from "src/steps/types";
import { BaseStepExecutor } from "../executors/base";
import { ExecutionBindings } from "src/workflow";
import { DefaultBatchExecutor } from "./default_batch_executor";

export class BatchStepExecutor extends BaseStepExecutor {
    readonly executor: BatchExecutor;
    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const batchResults = await this.executor.execute(input);
        return {
            output: batchResults,
        }
    }

    constructor(step: BatchStep, bindings: Record<string, any>) {
        super(step)
        if(step.executor) {
            this.executor = bindings[step.executor] as BatchExecutor
        } else {
            this.executor = new DefaultBatchExecutor(step);
        }
      }
}

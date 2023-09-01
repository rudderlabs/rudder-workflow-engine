import { BatchConfig, BatchExecutor, BatchResult, BatchStep } from "src/steps/types";

export class DefaultBatchExecutor implements BatchExecutor {
    readonly batches: BatchConfig[];
    constructor(step: BatchStep) { 
        this.batches = step.batches as BatchConfig[];
    }
    execute(input: any[]): Promise<BatchResult[]> {
        throw new Error("Method not implemented.");
    }
}
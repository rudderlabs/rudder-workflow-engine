import { Logger } from "pino";
import { Dictionary } from "../types";
import { ComposableExecutorFactory } from "./composed";
import { Step, StepExecutor } from "./types";
import { BaseStepExectorFactory } from "./base/factory";

export class StepExecutorFactory {
    static create(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): StepExecutor {
        let stepExecutor: StepExecutor = BaseStepExectorFactory.create(step, rootPath, bindings, parentLogger);
        stepExecutor = ComposableExecutorFactory.create(step, stepExecutor);
        return stepExecutor;
    }
}

import { join } from 'path';
import { Logger } from 'pino';
import { WorkflowEngineError } from '../../errors';
import { Dictionary, ExecutionBindings } from '../../types';
import { WorkflowUtils } from '../../utils';
import { BaseStepExecutor } from './base_executor';
import { StepExecutorFactory } from '../factory';
import { StepExecutor, StepOutput, StepType, WorkflowStep } from '../types';

export class WorkflowStepExecutor extends BaseStepExecutor {
  private readonly stepExecutors: StepExecutor[];
  constructor(
    step: WorkflowStep,
    rootPath: string,
    workflowBindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    const newStep = WorkflowStepExecutor.populate(step, rootPath);
    const bindings = Object.assign(
      {},
      workflowBindings,
      WorkflowUtils.extractBindings(rootPath, newStep.bindings),
    );
    super(newStep, rootPath, bindings, parentLogger.child({ workflow: step.name }));
    this.stepExecutors = this.prepareStepExecutors();
  }

  private static populate(step: WorkflowStep, rootPath: string): WorkflowStep {
    let newStep = step;
    if (step.workflowStepPath) {
      const workflowStepPath = join(rootPath, step.workflowStepPath);
      const workflowStepFromPath = WorkflowUtils.createFromFilePath<WorkflowStep>(workflowStepPath);
      newStep = Object.assign({}, workflowStepFromPath, step);
    }
    if (!newStep.steps?.length) {
      throw new WorkflowEngineError('Invalid workflow step configuration', 400, step.name);
    }
    return newStep;
  }

  private prepareStepExecutors(): StepExecutor[] {
    const steps = (this.step as WorkflowStep).steps || [];
    steps.forEach((step) => (step.type = StepType.Simple));
    return steps.map((step) =>
      StepExecutorFactory.create(step, this.rootPath, this.bindings, this.getLogger()),
    );
  }

  getStepExecutor(stepName: string): StepExecutor | undefined {
    return this.stepExecutors.find((stepExecutor) => stepExecutor.getStepName() === stepName);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    executionBindings.outputs[this.getStepName()] = {};
    let finalOutput: any;
    for (const simpleStepExecutor of this.stepExecutors) {
      const { skipped, output } = await simpleStepExecutor.execute(input, executionBindings);
      if (!skipped) {
        executionBindings.outputs[this.getStepName()][simpleStepExecutor.getStepName()] = output;
        finalOutput = output;
      }
    }
    return { outputs: executionBindings.outputs[this.step.name], output: finalOutput };
  }
}

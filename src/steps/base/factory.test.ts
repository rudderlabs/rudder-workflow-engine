import { StepType } from '../../common/types';
import { BaseStepExecutorFactory } from './factory';

describe('BaseStepExecutorFactory: ', () => {
  describe('create:', () => {
    it('should throw error when step type is unknown', () => {
      expect(() =>
        BaseStepExecutorFactory.create(
          { type: StepType.Unknown, name: 'unknowStep' },
          { rootPath: __dirname, currentBindings: {} },
        ),
      ).toThrow();
    });
  });
});

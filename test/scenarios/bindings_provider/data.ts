import { BindingProvider } from './provider';
import { Scenario } from '../../types';

export const data = [
  {
    output: 'Got binding from provider.Got binding from normal binding.',
    options: {
      bindingProvider: BindingProvider.INSTANCE,
    },
  },
] as Scenario[];

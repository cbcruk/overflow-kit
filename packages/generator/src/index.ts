export { DomMeasurer, measureElement, measureElements } from './dom-measurer'
export type { DomMeasurerOptions } from './dom-measurer'

export { GeneratorStateMachine, createOverflowGenerator } from './state-machine'
export type {
  Phase,
  GeneratorState,
  GeneratorStep,
  OverflowGenerator,
  StateMachineOptions,
} from './state-machine'

export { GeneratorCalculator, calculateWithGenerator } from './calculator'
export type { GeneratorCalculatorOptions } from './calculator'

export type {
  ItemStyle,
  OverflowItem,
  MeasuredItem,
  OverflowResult,
  CalculatorOptions,
} from '@overflow-kit/core'

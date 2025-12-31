/**
 * Phases of the overflow calculation process.
 */
export type Phase =
  | 'idle'
  | 'rendering'
  | 'measuring'
  | 'calculating'
  | 'complete'

/**
 * Current state of the generator state machine.
 */
export interface GeneratorState<T> {
  /** Current phase of the calculation */
  phase: Phase
  /** Current value/result */
  value: T
}

/**
 * A single step yielded by the generator.
 */
export type GeneratorStep<T> = {
  phase: Phase
  value: T
}

/**
 * Generator type for overflow calculation.
 */
export type OverflowGenerator<T> = Generator<GeneratorStep<T>, void, void>

/**
 * Options for GeneratorStateMachine.
 */
export interface StateMachineOptions<T> {
  /** Initial value before calculation starts */
  initialValue: T
  /** Callback invoked when state changes */
  onStateChange?: (state: GeneratorState<T>) => void
}

/**
 * Manages generator execution with state tracking.
 * Allows step-by-step execution for integration with React's rendering cycle.
 *
 * @example
 * ```ts
 * const machine = new GeneratorStateMachine({
 *   initialValue: { count: 0 },
 *   onStateChange: (state) => console.log(state.phase)
 * })
 * machine.start(function* () {
 *   yield { phase: 'measuring', value: { count: 1 } }
 *   yield { phase: 'complete', value: { count: 2 } }
 * })
 * while (machine.isRunning()) {
 *   machine.next()
 * }
 * ```
 */
export class GeneratorStateMachine<T> {
  private currentState: GeneratorState<T>
  private generator: OverflowGenerator<T> | null = null
  private onStateChange?: (state: GeneratorState<T>) => void

  constructor(options: StateMachineOptions<T>) {
    this.currentState = {
      phase: 'idle',
      value: options.initialValue,
    }
    this.onStateChange = options.onStateChange
  }

  /**
   * Returns a copy of the current state.
   */
  getState(): GeneratorState<T> {
    return { ...this.currentState }
  }

  /**
   * Starts a new generator and advances to the first step.
   * @param generatorFn - Function that returns a generator
   */
  start(generatorFn: () => OverflowGenerator<T>): void {
    this.generator = generatorFn()
    this.next()
  }

  /**
   * Advances to the next step.
   * @returns true if there are more steps, false if complete
   */
  next(): boolean {
    if (!this.generator) {
      return false
    }

    const result = this.generator.next()

    if (result.done) {
      this.generator = null
      return false
    }

    this.currentState = {
      phase: result.value.phase,
      value: result.value.value,
    }

    this.onStateChange?.(this.currentState)

    return true
  }

  /**
   * Resets the state machine to idle with a new value.
   * @param value - New initial value
   */
  reset(value: T): void {
    this.generator = null
    this.currentState = {
      phase: 'idle',
      value,
    }
    this.onStateChange?.(this.currentState)
  }

  /**
   * Returns whether the generator is still running.
   */
  isRunning(): boolean {
    return this.generator !== null
  }
}

/**
 * Creates a generator function from an array of steps.
 * Each step has a phase and a compute function that returns the value.
 *
 * @example
 * ```ts
 * const gen = createOverflowGenerator([
 *   { phase: 'measuring', compute: () => measureItems() },
 *   { phase: 'complete', compute: () => calculateResult() }
 * ])
 * ```
 */
export function createOverflowGenerator<T>(
  steps: Array<{ phase: Phase; compute: () => T }>
): () => OverflowGenerator<T> {
  return function* () {
    for (const step of steps) {
      yield {
        phase: step.phase,
        value: step.compute(),
      }
    }
  }
}

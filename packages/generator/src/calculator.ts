import type {
  OverflowItem,
  OverflowResult,
  MeasuredItem,
} from '@overflow-kit/core'
import { calculateOverflow, getRestIndicatorText } from '@overflow-kit/core'
import { DomMeasurer } from './dom-measurer'
import {
  GeneratorStateMachine,
  type Phase,
  type GeneratorState,
  type OverflowGenerator,
} from './state-machine'

/**
 * Options for GeneratorCalculator.
 */
export interface GeneratorCalculatorOptions {
  /** Gap between items (in pixels). @default 8 */
  gap?: number
  /** Width reserved for rest indicator (in pixels). @default 40 */
  restIndicatorWidth?: number
  /** Function to generate rest indicator text */
  restIndicatorText?: (count: number) => string
  /** Padding inside the container (in pixels). @default 0 */
  containerPadding?: number
  /** Function to retrieve DOM element by item key */
  getElement: (key: string | number) => HTMLElement | null
  /** Callback invoked when state changes */
  onStateChange?: (state: GeneratorState<OverflowResult>) => void
  /** Container element to observe for size changes */
  containerElement?: HTMLElement
  /** Callback invoked when container size changes */
  onResize?: (result: OverflowResult, width: number) => void
}

const createEmptyResult = (): OverflowResult => ({
  visibleCount: 0,
  hiddenCount: 0,
  visibleItems: [],
  hiddenItems: [],
  totalItemsWidth: 0,
})

/**
 * Combines DOM measurement and overflow calculation using generators.
 * Designed for integration with React's rendering cycle through step-by-step execution.
 *
 * Phases:
 * 1. `rendering` - Items are rendered to DOM (with zero widths)
 * 2. `measuring` - DOM elements are measured
 * 3. `calculating` - Overflow calculation is performed
 * 4. `complete` - Final result is available
 *
 * @example
 * ```ts
 * const calculator = new GeneratorCalculator({
 *   gap: 8,
 *   getElement: (key) => document.getElementById(`item-${key}`),
 *   onStateChange: (state) => updateUI(state)
 * })
 * calculator.setItems(items)
 * calculator.calculate(containerWidth)
 * // Use nextStep() with React's useEffect or useLayoutEffect
 * ```
 */
export class GeneratorCalculator {
  private measurer: DomMeasurer
  private options: Omit<
    GeneratorCalculatorOptions,
    'getElement' | 'onStateChange' | 'containerElement' | 'onResize'
  >
  private stateMachine: GeneratorStateMachine<OverflowResult>
  private items: OverflowItem[] = []
  private measurements: Map<string | number, MeasuredItem> = new Map()
  private resizeObserver: ResizeObserver | null = null
  private onResizeCallback?: (result: OverflowResult, width: number) => void
  private containerWidth: number = 0

  constructor(options: GeneratorCalculatorOptions) {
    this.measurer = new DomMeasurer({
      getElement: options.getElement,
    })

    this.options = {
      gap: options.gap,
      restIndicatorWidth: options.restIndicatorWidth,
      restIndicatorText: options.restIndicatorText,
      containerPadding: options.containerPadding,
    }

    this.stateMachine = new GeneratorStateMachine({
      initialValue: createEmptyResult(),
      onStateChange: options.onStateChange,
    })

    this.onResizeCallback = options.onResize

    if (options.containerElement) {
      this.observeContainer(options.containerElement)
    }
  }

  /**
   * Starts observing a container element for size changes.
   * @param element - Container element to observe
   */
  observeContainer(element: HTMLElement): void {
    this.disconnectObserver()

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        const width = entry.contentRect.width

        if (width !== this.containerWidth) {
          this.containerWidth = width

          if (this.onResizeCallback && this.items.length > 0) {
            const result = this.runToCompletion(width)

            this.onResizeCallback(result, width)
          }
        }
      }
    })

    this.resizeObserver.observe(element)
  }

  /**
   * Stops observing the container element.
   */
  disconnectObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  }

  /**
   * Sets items to calculate overflow for.
   * @param items - Items to process
   */
  setItems(items: OverflowItem[]): void {
    this.items = [...items]
    this.measurements.clear()
  }

  /**
   * Returns a copy of the current state.
   */
  getState(): GeneratorState<OverflowResult> {
    return this.stateMachine.getState()
  }

  /**
   * Creates a generator for the calculation process.
   * @param containerWidth - Available container width (in pixels)
   */
  *createCalculationGenerator(
    containerWidth: number
  ): OverflowGenerator<OverflowResult> {
    yield {
      phase: 'rendering' as Phase,
      value: {
        ...createEmptyResult(),
        visibleItems: this.items.map((item) => ({
          ...item,
          textWidth: 0,
          totalWidth: 0,
        })),
      },
    }

    yield {
      phase: 'measuring' as Phase,
      value: this.stateMachine.getState().value,
    }

    this.measurements = this.measurer.measureAll(this.items)

    yield {
      phase: 'calculating' as Phase,
      value: this.stateMachine.getState().value,
    }

    const measuredItems = Array.from(this.measurements.values())
    const result = calculateOverflow({
      items: measuredItems,
      containerWidth,
      options: this.options,
    })

    yield {
      phase: 'complete' as Phase,
      value: result,
    }
  }

  /**
   * Starts the calculation process.
   * Use nextStep() to advance through phases.
   * @param containerWidth - Available container width (in pixels)
   */
  calculate(containerWidth: number): void {
    const generator = this.createCalculationGenerator.bind(this)
    this.stateMachine.start(function* () {
      yield* generator(containerWidth)
    })
  }

  /**
   * Advances to the next step of the calculation.
   * @returns true if there are more steps, false if complete
   */
  nextStep(): boolean {
    return this.stateMachine.next()
  }

  /**
   * Runs the entire calculation synchronously.
   * @param containerWidth - Available container width (in pixels)
   * @returns Final overflow result
   */
  runToCompletion(containerWidth: number): OverflowResult {
    this.calculate(containerWidth)

    while (this.stateMachine.isRunning()) {
      this.stateMachine.next()
    }

    return this.stateMachine.getState().value
  }

  /**
   * Generates rest indicator text.
   * @param count - Number of hidden items
   * @returns Text like "+3"
   */
  getRestIndicatorText(count: number): string {
    return getRestIndicatorText(count, this.options.restIndicatorText)
  }

  /**
   * Returns a measurement by item key.
   * @param key - Key of the item
   */
  getMeasurement(key: string | number): MeasuredItem | undefined {
    return this.measurements.get(key)
  }

  /**
   * Returns all measurements.
   */
  getAllMeasurements(): MeasuredItem[] {
    return Array.from(this.measurements.values())
  }

  /**
   * Resets the calculator to idle state.
   */
  reset(): void {
    this.disconnectObserver()
    this.stateMachine.reset(createEmptyResult())
    this.measurements.clear()
  }
}

/**
 * Convenience function for synchronous overflow calculation with DOM measurement.
 *
 * @example
 * ```ts
 * const result = calculateWithGenerator(
 *   items,
 *   300,
 *   { getElement: (key) => document.getElementById(`item-${key}`) }
 * )
 * ```
 */
export function calculateWithGenerator(
  items: OverflowItem[],
  containerWidth: number,
  options: GeneratorCalculatorOptions
): OverflowResult {
  const calculator = new GeneratorCalculator(options)
  calculator.setItems(items)
  return calculator.runToCompletion(containerWidth)
}

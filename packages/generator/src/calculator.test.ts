import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GeneratorCalculator, calculateWithGenerator } from './calculator'

describe('GeneratorCalculator', () => {
  let container: HTMLDivElement
  let elements: Map<string | number, HTMLElement>

  beforeEach(() => {
    container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '0'
    document.body.appendChild(container)
    elements = new Map()
  })

  afterEach(() => {
    document.body.removeChild(container)
    elements.clear()
  })

  const createTestElement = (key: string | number, width: number): void => {
    const el = document.createElement('span')
    el.id = `item-${key}`
    el.style.display = 'inline-block'
    el.style.width = `${width}px`
    el.style.height = '20px'
    el.textContent = `Item ${key}`
    container.appendChild(el)
    elements.set(key, el)
  }

  const createCalculator = (
    options?: Partial<ConstructorParameters<typeof GeneratorCalculator>[0]>
  ) =>
    new GeneratorCalculator({
      getElement: (key) => elements.get(key) ?? null,
      gap: 8,
      ...options,
    })

  describe('setItems', () => {
    it('sets items to calculate', () => {
      const calculator = createCalculator()

      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      expect(calculator.getState().phase).toBe('idle')
    })
  })

  describe('calculate', () => {
    it('starts calculation and enters rendering phase', () => {
      createTestElement(1, 50)
      createTestElement(2, 50)

      const calculator = createCalculator()
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      calculator.calculate(300)

      expect(calculator.getState().phase).toBe('rendering')
    })
  })

  describe('nextStep', () => {
    it('advances through phases', () => {
      createTestElement(1, 50)

      const calculator = createCalculator()
      calculator.setItems([{ key: 1, text: 'A' }])
      calculator.calculate(300)

      expect(calculator.getState().phase).toBe('rendering')

      calculator.nextStep()
      expect(calculator.getState().phase).toBe('measuring')

      calculator.nextStep()
      expect(calculator.getState().phase).toBe('calculating')

      calculator.nextStep()
      expect(calculator.getState().phase).toBe('complete')
    })

    it('returns false when complete', () => {
      createTestElement(1, 50)

      const calculator = createCalculator()
      calculator.setItems([{ key: 1, text: 'A' }])
      calculator.calculate(300)

      calculator.nextStep()
      calculator.nextStep()
      calculator.nextStep()

      expect(calculator.nextStep()).toBe(false)
    })
  })

  describe('runToCompletion', () => {
    it('runs all phases and returns result', () => {
      createTestElement(1, 50)
      createTestElement(2, 100)

      const calculator = createCalculator()
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])

      const result = calculator.runToCompletion(500)

      expect(result.visibleCount).toBe(2)
      expect(result.hiddenCount).toBe(0)
      expect(calculator.getState().phase).toBe('complete')
    })

    it('correctly hides overflow items', () => {
      createTestElement(1, 100)
      createTestElement(2, 100)
      createTestElement(3, 100)

      const calculator = createCalculator({ restIndicatorWidth: 40 })
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
        { key: 3, text: 'C' },
      ])

      const result = calculator.runToCompletion(200)

      expect(result.hiddenCount).toBeGreaterThan(0)
    })
  })

  describe('onStateChange', () => {
    it('calls callback on each phase change', () => {
      createTestElement(1, 50)

      const onStateChange = vi.fn()
      const calculator = createCalculator({ onStateChange })

      calculator.setItems([{ key: 1, text: 'A' }])
      calculator.calculate(300)

      expect(onStateChange).toHaveBeenCalled()

      const phases = onStateChange.mock.calls.map((call) => call[0].phase)
      expect(phases[0]).toBe('rendering')
    })
  })

  describe('getMeasurement', () => {
    it('returns measurement after calculation', () => {
      createTestElement(1, 75)

      const calculator = createCalculator()
      calculator.setItems([{ key: 1, text: 'A' }])
      calculator.runToCompletion(300)

      const measurement = calculator.getMeasurement(1)

      expect(measurement).toBeDefined()
      expect(measurement?.totalWidth).toBe(75)
    })

    it('returns undefined before measurement phase', () => {
      const calculator = createCalculator()
      calculator.setItems([{ key: 1, text: 'A' }])

      expect(calculator.getMeasurement(1)).toBeUndefined()
    })
  })

  describe('getAllMeasurements', () => {
    it('returns all measurements', () => {
      createTestElement(1, 50)
      createTestElement(2, 100)

      const calculator = createCalculator()
      calculator.setItems([
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ])
      calculator.runToCompletion(300)

      const measurements = calculator.getAllMeasurements()

      expect(measurements).toHaveLength(2)
    })
  })

  describe('reset', () => {
    it('resets calculator state', () => {
      createTestElement(1, 50)

      const calculator = createCalculator()
      calculator.setItems([{ key: 1, text: 'A' }])
      calculator.runToCompletion(300)

      calculator.reset()

      expect(calculator.getState().phase).toBe('idle')
      expect(calculator.getAllMeasurements()).toHaveLength(0)
    })
  })

  describe('getRestIndicatorText', () => {
    it('uses default text', () => {
      const calculator = createCalculator()

      expect(calculator.getRestIndicatorText(5)).toBe('+5')
    })

    it('uses custom function', () => {
      const calculator = createCalculator({
        restIndicatorText: (n) => `${n} hidden`,
      })

      expect(calculator.getRestIndicatorText(5)).toBe('5 hidden')
    })
  })
})

describe('calculateWithGenerator', () => {
  let container: HTMLDivElement
  let elements: Map<string | number, HTMLElement>

  beforeEach(() => {
    container = document.createElement('div')
    container.style.position = 'absolute'
    document.body.appendChild(container)
    elements = new Map()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('calculates overflow in one call', () => {
    const el1 = document.createElement('span')
    el1.style.display = 'inline-block'
    el1.style.width = '50px'
    container.appendChild(el1)
    elements.set(1, el1)

    const el2 = document.createElement('span')
    el2.style.display = 'inline-block'
    el2.style.width = '50px'
    container.appendChild(el2)
    elements.set(2, el2)

    const result = calculateWithGenerator(
      [
        { key: 1, text: 'A' },
        { key: 2, text: 'B' },
      ],
      500,
      {
        getElement: (key) => elements.get(key) ?? null,
      }
    )

    expect(result.visibleCount).toBe(2)
    expect(result.totalItemsWidth).toBeGreaterThan(0)
  })
})

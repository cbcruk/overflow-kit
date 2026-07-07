import { describe, it, expect, vi } from 'vitest'
import {
  GeneratorStateMachine,
  createOverflowGenerator,
  type GeneratorState,
} from './state-machine'

describe('GeneratorStateMachine', () => {
  it('starts idle with the provided initial value', () => {
    const machine = new GeneratorStateMachine({ initialValue: { count: 0 } })

    expect(machine.getState()).toEqual({ phase: 'idle', value: { count: 0 } })
    expect(machine.isRunning()).toBe(false)
  })

  it('advances through yielded steps and reports completion', () => {
    const machine = new GeneratorStateMachine<{ count: number }>({
      initialValue: { count: 0 },
    })

    machine.start(function* () {
      yield { phase: 'measuring', value: { count: 1 } }
      yield { phase: 'complete', value: { count: 2 } }
    })

    // start() consumes the first step
    expect(machine.getState()).toEqual({
      phase: 'measuring',
      value: { count: 1 },
    })
    expect(machine.isRunning()).toBe(true)

    expect(machine.next()).toBe(true)
    expect(machine.getState()).toEqual({
      phase: 'complete',
      value: { count: 2 },
    })

    // no more steps
    expect(machine.next()).toBe(false)
    expect(machine.isRunning()).toBe(false)
  })

  it('notifies onStateChange for every transition', () => {
    const phases: string[] = []
    const machine = new GeneratorStateMachine<number>({
      initialValue: 0,
      onStateChange: (state: GeneratorState<number>) =>
        phases.push(state.phase),
    })

    machine.start(function* () {
      yield { phase: 'rendering', value: 1 }
      yield { phase: 'complete', value: 2 }
    })
    while (machine.isRunning()) machine.next()

    expect(phases).toEqual(['rendering', 'complete'])
  })

  it('returns a defensive copy from getState', () => {
    const machine = new GeneratorStateMachine({ initialValue: { count: 0 } })

    const a = machine.getState()
    const b = machine.getState()

    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('reset() returns to idle with a new value and fires onStateChange', () => {
    const onStateChange = vi.fn()
    const machine = new GeneratorStateMachine<number>({
      initialValue: 0,
      onStateChange,
    })

    machine.start(function* () {
      yield { phase: 'measuring', value: 1 }
    })
    onStateChange.mockClear()

    machine.reset(99)

    expect(machine.getState()).toEqual({ phase: 'idle', value: 99 })
    expect(machine.isRunning()).toBe(false)
    expect(onStateChange).toHaveBeenCalledWith({ phase: 'idle', value: 99 })
  })

  it('next() before start() is a no-op', () => {
    const machine = new GeneratorStateMachine({ initialValue: 0 })
    expect(machine.next()).toBe(false)
  })
})

describe('createOverflowGenerator', () => {
  it('yields a step per entry and computes lazily in order', () => {
    const order: string[] = []
    const gen = createOverflowGenerator<number>([
      {
        phase: 'measuring',
        compute: () => {
          order.push('measuring')
          return 1
        },
      },
      {
        phase: 'complete',
        compute: () => {
          order.push('complete')
          return 2
        },
      },
    ])()

    // nothing computed until iterated
    expect(order).toEqual([])

    expect(gen.next().value).toEqual({ phase: 'measuring', value: 1 })
    expect(order).toEqual(['measuring'])

    expect(gen.next().value).toEqual({ phase: 'complete', value: 2 })
    expect(gen.next().done).toBe(true)
    expect(order).toEqual(['measuring', 'complete'])
  })
})

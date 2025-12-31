import { describe, it, expect, vi } from 'vitest'
import {
  GeneratorStateMachine,
  createOverflowGenerator,
  type Phase,
} from './state-machine'

describe('GeneratorStateMachine', () => {
  describe('initial state', () => {
    it('starts in idle phase with initial value', () => {
      const machine = new GeneratorStateMachine({
        initialValue: { count: 0 },
      })

      const state = machine.getState()

      expect(state.phase).toBe('idle')
      expect(state.value).toEqual({ count: 0 })
    })
  })

  describe('start', () => {
    it('starts generator and advances to first step', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
        yield { phase: 'complete' as Phase, value: 2 }
      })

      expect(machine.getState().phase).toBe('measuring')
      expect(machine.getState().value).toBe(1)
    })
  })

  describe('next', () => {
    it('advances to next step', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
        yield { phase: 'calculating' as Phase, value: 2 }
        yield { phase: 'complete' as Phase, value: 3 }
      })

      expect(machine.getState().value).toBe(1)

      machine.next()
      expect(machine.getState().value).toBe(2)

      machine.next()
      expect(machine.getState().value).toBe(3)
    })

    it('returns true while steps remain', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
        yield { phase: 'complete' as Phase, value: 2 }
      })

      expect(machine.next()).toBe(true)
      expect(machine.next()).toBe(false)
    })

    it('returns false when no generator', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      expect(machine.next()).toBe(false)
    })
  })

  describe('isRunning', () => {
    it('returns true while generator is active', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      expect(machine.isRunning()).toBe(false)

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
        yield { phase: 'complete' as Phase, value: 2 }
      })

      expect(machine.isRunning()).toBe(true)

      machine.next()
      expect(machine.isRunning()).toBe(true)

      machine.next()
      expect(machine.isRunning()).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets to idle with new value', () => {
      const machine = new GeneratorStateMachine({
        initialValue: 0,
      })

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
      })

      machine.reset(100)

      expect(machine.getState().phase).toBe('idle')
      expect(machine.getState().value).toBe(100)
      expect(machine.isRunning()).toBe(false)
    })
  })

  describe('onStateChange callback', () => {
    it('calls callback on each state change', () => {
      const onStateChange = vi.fn()
      const machine = new GeneratorStateMachine({
        initialValue: 0,
        onStateChange,
      })

      machine.start(function* () {
        yield { phase: 'measuring' as Phase, value: 1 }
        yield { phase: 'complete' as Phase, value: 2 }
      })

      expect(onStateChange).toHaveBeenCalledTimes(1)
      expect(onStateChange).toHaveBeenCalledWith({
        phase: 'measuring',
        value: 1,
      })

      machine.next()

      expect(onStateChange).toHaveBeenCalledTimes(2)
      expect(onStateChange).toHaveBeenLastCalledWith({
        phase: 'complete',
        value: 2,
      })
    })

    it('calls callback on reset', () => {
      const onStateChange = vi.fn()
      const machine = new GeneratorStateMachine({
        initialValue: 0,
        onStateChange,
      })

      machine.reset(50)

      expect(onStateChange).toHaveBeenCalledWith({
        phase: 'idle',
        value: 50,
      })
    })
  })

  describe('getState', () => {
    it('returns a copy of current state', () => {
      const machine = new GeneratorStateMachine({
        initialValue: { count: 0 },
      })

      const state1 = machine.getState()
      const state2 = machine.getState()

      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })
  })
})

describe('createOverflowGenerator', () => {
  it('creates generator from steps array', () => {
    const gen = createOverflowGenerator([
      { phase: 'measuring', compute: () => 1 },
      { phase: 'calculating', compute: () => 2 },
      { phase: 'complete', compute: () => 3 },
    ])

    const generator = gen()
    const results: Array<{ phase: Phase; value: number }> = []

    let result = generator.next()
    while (!result.done) {
      results.push(result.value)
      result = generator.next()
    }

    expect(results).toEqual([
      { phase: 'measuring', value: 1 },
      { phase: 'calculating', value: 2 },
      { phase: 'complete', value: 3 },
    ])
  })

  it('calls compute function lazily', () => {
    const computeFn = vi.fn(() => 42)
    const gen = createOverflowGenerator([
      { phase: 'complete', compute: computeFn },
    ])

    expect(computeFn).not.toHaveBeenCalled()

    const generator = gen()
    generator.next()

    expect(computeFn).toHaveBeenCalledTimes(1)
  })
})

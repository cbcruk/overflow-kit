import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import {
  GeneratorCalculator,
  type OverflowItem,
  type OverflowResult,
  type GeneratorState,
  type Phase,
} from 'overflow-kit/generator'
import styles from './generator-demo.module.css'

const SAMPLE_ITEMS: OverflowItem[] = [
  { key: 1, text: 'Dashboard' },
  { key: 2, text: 'Analytics' },
  { key: 3, text: 'Settings' },
  { key: 4, text: 'Profile' },
  { key: 5, text: 'Notifications' },
  { key: 6, text: 'Help Center' },
  { key: 7, text: 'Documentation' },
]

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Idle',
  rendering: 'Rendering',
  measuring: 'Measuring',
  calculating: 'Calculating',
  complete: 'Complete',
}

export function GeneratorDemo(): JSX.Element {
  const [styleWidth, setStyleWidth] = useState(400)
  const [measuredWidth, setMeasuredWidth] = useState(400)
  const [newItemText, setNewItemText] = useState('')
  const [items, setItems] = useState<OverflowItem[]>(SAMPLE_ITEMS)
  const [result, setResult] = useState<OverflowResult>({
    visibleCount: 0,
    hiddenCount: 0,
    visibleItems: [],
    hiddenItems: [],
    totalItemsWidth: 0,
  })
  const [phase, setPhase] = useState<Phase>('idle')

  const containerRef = useRef<HTMLDivElement>(null)
  const calculatorRef = useRef<GeneratorCalculator | null>(null)

  const handleStateChange = useCallback(
    (state: GeneratorState<OverflowResult>): void => {
      setPhase(state.phase)
      setResult(state.value)
    },
    []
  )

  const handleResize = useCallback(
    (newResult: OverflowResult, width: number): void => {
      setResult(newResult)
      setMeasuredWidth(width)
    },
    []
  )

  useLayoutEffect(() => {
    const calculator = new GeneratorCalculator({
      gap: 4,
      itemClassName: styles.item,
      onStateChange: handleStateChange,
      onResize: handleResize,
      restIndicatorWidth: 40,
    })
    calculatorRef.current = calculator

    return () => calculator.reset()
  }, [handleStateChange, handleResize])

  useLayoutEffect(() => {
    const calculator = calculatorRef.current
    const container = containerRef.current
    if (!calculator || !container) return

    calculator.observeContainer(container)
  }, [])

  useLayoutEffect(() => {
    const calculator = calculatorRef.current
    if (!calculator) return

    calculator.setItems(items)
    calculator.calculate(measuredWidth)

    while (calculator.nextStep()) {
      // Run through all steps synchronously
    }
  }, [items, measuredWidth])

  const handleAddItem = useCallback((): void => {
    if (!newItemText.trim()) return
    const newItem: OverflowItem = {
      key: Date.now(),
      text: newItemText.trim(),
    }
    setItems((prev) => [...prev, newItem])
    setNewItemText('')
  }, [newItemText])

  const handleRemoveItem = useCallback((key: string | number): void => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter') {
        handleAddItem()
      }
    },
    [handleAddItem]
  )

  return (
    <div className="demo-section">
      <h2>Generator Demo</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Uses DOM measurement with generator-based state machine for React
        integration.
      </p>

      <div
        ref={containerRef}
        className="demo-container"
        style={{ width: styleWidth, maxWidth: '100%' }}
      >
        <div className="demo-items">
          {result.visibleItems.map((item) => (
            <span
              key={item.key}
              className={styles.item}
              onClick={() => handleRemoveItem(item.key)}
              style={{ cursor: 'pointer' }}
              title="Click to remove"
            >
              {item.text}
            </span>
          ))}
          {result.hiddenItems.length > 0 && (
            <span className="demo-rest-indicator">
              {calculatorRef.current?.getRestIndicatorText(
                result.hiddenItems.length
              ) ?? `+${result.hiddenItems.length}`}
            </span>
          )}
        </div>
      </div>

      <div className="demo-controls">
        <label>
          Container Width: {measuredWidth}px
          <input
            type="range"
            min={100}
            max={800}
            value={styleWidth}
            onChange={(e) => setStyleWidth(Number(e.target.value))}
          />
        </label>
        <span style={{ color: '#888', fontSize: 13 }}>
          Phase: <code>{PHASE_LABELS[phase]}</code>
        </span>
      </div>

      <div className="demo-controls">
        <input
          type="text"
          placeholder="Add new item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>

      <div className="demo-info">
        <p>
          <strong>Visible:</strong> {result.visibleItems.length} items |{' '}
          <strong>Hidden:</strong> {result.hiddenItems.length} items
        </p>
        {result.hiddenItems.length > 0 && (
          <p>
            <strong>Hidden items:</strong>{' '}
            {result.hiddenItems.map((item) => item.text).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

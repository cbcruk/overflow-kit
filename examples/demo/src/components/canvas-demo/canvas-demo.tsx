import { useState, useMemo, useCallback } from 'react'
import { CanvasCalculator, type OverflowItem } from '@overflow-kit/canvas'

const SAMPLE_ITEMS: OverflowItem[] = [
  { key: 1, text: 'React' },
  { key: 2, text: 'TypeScript' },
  { key: 3, text: 'JavaScript' },
  { key: 4, text: 'Node.js' },
  { key: 5, text: 'GraphQL' },
  { key: 6, text: 'Next.js' },
  { key: 7, text: 'Tailwind CSS' },
  { key: 8, text: 'Vite' },
]

export function CanvasDemo(): JSX.Element {
  const [containerWidth, setContainerWidth] = useState(400)
  const [newItemText, setNewItemText] = useState('')
  const [items, setItems] = useState<OverflowItem[]>(SAMPLE_ITEMS)

  const calculator = useMemo(() => {
    const calc = new CanvasCalculator({
      font: '14px -apple-system, BlinkMacSystemFont, sans-serif',
      gap: 4,
      itemStyle: {
        paddingLeft: 8,
        paddingRight: 8,
        borderWidth: 1,
      },
    })
    calc.setItems(items)
    return calc
  }, [items])

  const result = useMemo(() => {
    return calculator.calculate(containerWidth)
  }, [calculator, containerWidth])

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
      <h2>Canvas Demo</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Uses Canvas API for text measurement without DOM rendering.
      </p>

      <div
        className="demo-container"
        style={{ width: containerWidth, maxWidth: '100%' }}
      >
        <div className="demo-items">
          {result.visibleItems.map((item) => (
            <span
              key={item.key}
              className="demo-item"
              onClick={() => handleRemoveItem(item.key)}
              style={{ cursor: 'pointer' }}
              title="Click to remove"
            >
              {item.text}
            </span>
          ))}
          {result.hiddenItems.length > 0 && (
            <span className="demo-rest-indicator">
              {calculator.getRestIndicatorText(result.hiddenItems.length)}
            </span>
          )}
        </div>
      </div>

      <div className="demo-controls">
        <label>
          Container Width: {containerWidth}px
          <input
            type="range"
            min={100}
            max={800}
            value={containerWidth}
            onChange={(e) => setContainerWidth(Number(e.target.value))}
          />
        </label>
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

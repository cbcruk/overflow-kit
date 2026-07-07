import { useState, useCallback } from 'react'
import { useCanvasOverflow, type OverflowItem } from 'overflow-kit/react'

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
  const [width, setWidth] = useState(400)
  const [newItemText, setNewItemText] = useState('')
  const [items, setItems] = useState<OverflowItem[]>(SAMPLE_ITEMS)

  const {
    containerRef,
    visibleItems,
    hiddenItems,
    hiddenCount,
    getRestIndicatorText,
  } = useCanvasOverflow<HTMLDivElement>(items, {
    font: '14px -apple-system, BlinkMacSystemFont, sans-serif',
    gap: 4,
    itemStyle: {
      paddingLeft: 8,
      paddingRight: 8,
      borderWidth: 1,
    },
  })

  const handleAddItem = useCallback((): void => {
    if (!newItemText.trim()) return
    setItems((prev) => [...prev, { key: Date.now(), text: newItemText.trim() }])
    setNewItemText('')
  }, [newItemText])

  const handleRemoveItem = useCallback((key: string | number): void => {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter') handleAddItem()
    },
    [handleAddItem]
  )

  return (
    <div className="demo-section">
      <h2>useCanvasOverflow (Canvas)</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        The <code>useCanvasOverflow</code> hook measures text with the Canvas
        API — no DOM rendering required.
      </p>

      <div
        ref={containerRef}
        className="demo-container"
        style={{ width, maxWidth: '100%' }}
      >
        <div className="demo-items">
          {visibleItems.map((item) => (
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
          {hiddenCount > 0 && (
            <span className="demo-rest-indicator">
              {getRestIndicatorText(hiddenCount)}
            </span>
          )}
        </div>
      </div>

      <div className="demo-controls">
        <label>
          Container Width: {width}px
          <input
            type="range"
            min={100}
            max={800}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
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
          <strong>Visible:</strong> {visibleItems.length} items |{' '}
          <strong>Hidden:</strong> {hiddenItems.length} items
        </p>
        {hiddenItems.length > 0 && (
          <p>
            <strong>Hidden items:</strong>{' '}
            {hiddenItems.map((item) => item.text).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

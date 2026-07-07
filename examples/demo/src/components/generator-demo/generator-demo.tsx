import { useState, useCallback } from 'react'
import { useOverflow, type OverflowItem } from 'overflow-kit/react'
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

export function GeneratorDemo(): JSX.Element {
  const [width, setWidth] = useState(400)
  const [newItemText, setNewItemText] = useState('')
  const [items, setItems] = useState<OverflowItem[]>(SAMPLE_ITEMS)

  const {
    containerRef,
    visibleItems,
    hiddenItems,
    hiddenCount,
    getRestIndicatorText,
  } = useOverflow<HTMLDivElement>(items, {
    gap: 4,
    restIndicatorWidth: 40,
    itemClassName: styles.item,
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
      <h2>useOverflow (DOM)</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        The <code>useOverflow</code> hook measures items in the DOM and tracks
        the container size automatically.
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
              className={styles.item}
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

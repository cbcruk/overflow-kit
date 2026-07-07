import { useState, useCallback } from 'react'
import { OverflowContainer, type OverflowItem } from 'overflow-kit/react'

const SAMPLE_ITEMS: OverflowItem[] = [
  { key: 1, text: 'Design' },
  { key: 2, text: 'Engineering' },
  { key: 3, text: 'Marketing' },
  { key: 4, text: 'Sales' },
  { key: 5, text: 'Support' },
  { key: 6, text: 'Operations' },
  { key: 7, text: 'Finance' },
]

export function ContainerDemo(): JSX.Element {
  const [width, setWidth] = useState(400)
  const [newItemText, setNewItemText] = useState('')
  const [items, setItems] = useState<OverflowItem[]>(SAMPLE_ITEMS)

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
      <h2>OverflowContainer (declarative)</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        The <code>OverflowContainer</code> component wraps the hook with{' '}
        <code>renderItem</code> / <code>renderRest</code> props.
      </p>

      <div className="demo-container" style={{ width, maxWidth: '100%' }}>
        <OverflowContainer
          className="demo-items"
          items={items}
          options={{ gap: 4, restIndicatorWidth: 40 }}
          renderItem={(item) => (
            <span
              className="demo-item"
              onClick={() => handleRemoveItem(item.key)}
              style={{ cursor: 'pointer' }}
              title="Click to remove"
            >
              {item.text}
            </span>
          )}
          renderRest={(count) => (
            <span className="demo-rest-indicator">+{count}</span>
          )}
        />
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
    </div>
  )
}

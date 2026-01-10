# overflow-kit

A toolkit for calculating which items overflow a container and should be hidden.

## Installation

```bash
npm install overflow-kit
```

## Modules

| Module | Description |
|--------|-------------|
| `overflow-kit/core` | Pure calculation logic with no DOM dependencies |
| `overflow-kit/canvas` | Canvas-based text measurement for fast width calculation |
| `overflow-kit/generator` | DOM-based measurement using generators for React integration |

## Usage

### overflow-kit/core

Pure calculation logic when you already have measured item widths:

```typescript
import { OverflowCalculator } from 'overflow-kit/core'

const calculator = new OverflowCalculator({
  gap: 8,
  restIndicatorWidth: 40,
})

calculator.setItems([
  { key: 1, text: 'Item 1', textWidth: 50, totalWidth: 70 },
  { key: 2, text: 'Item 2', textWidth: 80, totalWidth: 100 },
  { key: 3, text: 'Item 3', textWidth: 60, totalWidth: 80 },
])

const result = calculator.calculate(200) // containerWidth

console.log(result.visibleItems) // Items that fit
console.log(result.hiddenItems)  // Items that overflow
console.log(result.hiddenCount)  // Number to show in "+N" indicator
```

### overflow-kit/canvas

Measure text width using Canvas API without DOM rendering:

```typescript
import { CanvasCalculator } from 'overflow-kit/canvas'

const calculator = new CanvasCalculator({
  font: '14px Inter, sans-serif',
  gap: 8,
  restIndicatorWidth: 40,
})

calculator.setItems([
  { key: 1, text: 'First Item' },
  { key: 2, text: 'Second Item' },
  { key: 3, text: 'Third Item' },
])

const result = calculator.calculate(containerWidth)
```

Or use the convenience function:

```typescript
import { calculateWithCanvas } from 'overflow-kit/canvas'

const result = calculateWithCanvas(items, containerWidth, {
  font: '14px Inter',
  gap: 8,
})
```

### overflow-kit/generator

For React applications, use generators to measure actual DOM elements:

```typescript
import { GeneratorCalculator } from 'overflow-kit/generator'

const calculator = new GeneratorCalculator({
  gap: 8,
  getElement: (key) => document.getElementById(`item-${key}`),
  onStateChange: (state) => {
    // Update React state on each phase
    // Phases: 'idle' -> 'rendering' -> 'measuring' -> 'calculating' -> 'complete'
  },
})

calculator.setItems(items)
calculator.calculate(containerWidth)

// Step through phases (call in useLayoutEffect)
while (calculator.nextStep()) {
  // Each step triggers onStateChange
}
```

## API Reference

### OverflowResult

All calculators return this result type:

```typescript
interface OverflowResult {
  visibleCount: number      // Number of visible items
  hiddenCount: number       // Number of hidden items
  visibleItems: MeasuredItem[]
  hiddenItems: MeasuredItem[]
  totalItemsWidth: number   // Total width of all items
}
```

### Calculator Options

```typescript
interface CalculatorOptions {
  gap?: number                              // Gap between items (default: 4)
  restIndicatorWidth?: number               // Width for "+N" indicator (default: 40)
  restIndicatorText?: (count: number) => string  // Custom text function
  containerPadding?: number                 // Container padding (default: 0)
}
```

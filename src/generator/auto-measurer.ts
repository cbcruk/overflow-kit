import type { OverflowItem, MeasuredItem } from '../core'

export interface AutoMeasurerOptions {
  itemClassName?: string
  itemStyle?: Partial<CSSStyleDeclaration>
}

const CONTAINER_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  left: '-9999px',
  top: '0',
  visibility: 'hidden',
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
}

export class AutoMeasurer {
  private container: HTMLElement | null = null
  private options: AutoMeasurerOptions

  constructor(options: AutoMeasurerOptions = {}) {
    this.options = options
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div')
    container.setAttribute('data-overflow-measurer', '')
    Object.assign(container.style, CONTAINER_STYLE)
    document.body.appendChild(container)
    return container
  }

  private createElement(item: OverflowItem): HTMLElement {
    const element = document.createElement('span')
    element.textContent = item.text

    if (this.options.itemClassName) {
      element.className = this.options.itemClassName
    }

    if (this.options.itemStyle) {
      Object.assign(element.style, this.options.itemStyle)
    }

    return element
  }

  measureAll(items: OverflowItem[]): Map<string | number, MeasuredItem> {
    this.container = this.createContainer()

    const elements = items.map((item) => {
      const element = this.createElement(item)
      this.container!.appendChild(element)
      return { item, element }
    })

    const measurements = new Map<string | number, MeasuredItem>()

    for (const { item, element } of elements) {
      const rect = element.getBoundingClientRect()
      measurements.set(item.key, {
        ...item,
        textWidth: rect.width,
        totalWidth: rect.width,
      })
    }

    this.cleanup()

    return measurements
  }

  private cleanup(): void {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
  }

  destroy(): void {
    this.cleanup()
  }
}

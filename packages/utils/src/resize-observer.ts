export interface ResizeObserverManager {
  observe: (element: HTMLElement) => void
  disconnect: () => void
}

export interface CreateResizeObserverOptions {
  onResize: (width: number) => void
}

export function createResizeObserverManager(
  options: CreateResizeObserverOptions
): ResizeObserverManager {
  let observer: ResizeObserver | null = null
  let currentWidth = 0

  const observe = (element: HTMLElement): void => {
    disconnect()

    observer = new ResizeObserver((entries) => {
      const entry = entries[0]

      if (entry) {
        const width = entry.contentRect.width

        if (width !== currentWidth) {
          currentWidth = width
          options.onResize(width)
        }
      }
    })

    observer.observe(element)
  }

  const disconnect = (): void => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    observe,
    disconnect,
  }
}

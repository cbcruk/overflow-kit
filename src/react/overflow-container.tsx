import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { MeasuredItem, OverflowItem } from '../core'
import { useOverflow, type UseOverflowOptions } from './use-overflow'
import {
  useCanvasOverflow,
  type UseCanvasOverflowOptions,
} from './use-canvas-overflow'
import type { UseOverflowResult } from './types'

/**
 * Presentational props shared by every {@link OverflowContainer} variant.
 */
export interface OverflowContainerRenderProps {
  /** Items to lay out. */
  items: OverflowItem[]
  /**
   * Renders a single visible item. The returned node does not need a `key`;
   * the container keys it by `item.key`.
   */
  renderItem: (item: MeasuredItem) => ReactNode
  /**
   * Renders the overflow indicator. Defaults to a `<span>` containing the
   * configured rest-indicator text (e.g. "+3"). Only rendered when items overflow.
   */
  renderRest?: (hiddenCount: number, hiddenItems: MeasuredItem[]) => ReactNode
  /** Class applied to the container element. */
  className?: string
  /** Inline styles applied to the container element. */
  style?: CSSProperties
}

/**
 * Props for {@link OverflowContainer}. The measurement `strategy` discriminates
 * which option set applies.
 */
export type OverflowContainerProps =
  | (OverflowContainerRenderProps & {
      strategy?: 'dom'
      options?: UseOverflowOptions
    })
  | (OverflowContainerRenderProps & {
      strategy: 'canvas'
      options?: UseCanvasOverflowOptions
    })

interface ViewProps extends Omit<OverflowContainerRenderProps, 'items'> {
  result: UseOverflowResult<HTMLDivElement>
}

function OverflowView({
  result,
  renderItem,
  renderRest,
  className,
  style,
}: ViewProps): JSX.Element {
  const {
    containerRef,
    visibleItems,
    hiddenItems,
    hiddenCount,
    getRestIndicatorText,
  } = result

  return (
    <div ref={containerRef} className={className} style={style}>
      {visibleItems.map((item) => (
        <Fragment key={item.key}>{renderItem(item)}</Fragment>
      ))}
      {hiddenCount > 0 &&
        (renderRest ? (
          renderRest(hiddenCount, hiddenItems)
        ) : (
          <span>{getRestIndicatorText(hiddenCount)}</span>
        ))}
    </div>
  )
}

function DomOverflowContainer({
  items,
  options,
  ...view
}: OverflowContainerRenderProps & {
  options?: UseOverflowOptions
}): JSX.Element {
  const result = useOverflow<HTMLDivElement>(items, options)
  return <OverflowView result={result} {...view} />
}

function CanvasOverflowContainer({
  items,
  options,
  ...view
}: OverflowContainerRenderProps & {
  options?: UseCanvasOverflowOptions
}): JSX.Element {
  const result = useCanvasOverflow<HTMLDivElement>(items, options)
  return <OverflowView result={result} {...view} />
}

/**
 * Declarative wrapper around {@link useOverflow} / {@link useCanvasOverflow}.
 * Renders a container that shows as many items as fit plus a rest indicator,
 * handling the ref, resize tracking, and recalculation for you.
 *
 * @example
 * ```tsx
 * <OverflowContainer
 *   items={tags}
 *   options={{ gap: 8, itemClassName: 'tag' }}
 *   renderItem={(item) => <span className="tag">{item.text}</span>}
 *   renderRest={(count) => <span className="tag">+{count}</span>}
 * />
 * ```
 *
 * Switch to Canvas measurement with `strategy="canvas"`:
 *
 * ```tsx
 * <OverflowContainer
 *   strategy="canvas"
 *   items={tabs}
 *   options={{ font: '14px Inter', gap: 8 }}
 *   renderItem={(item) => <span>{item.text}</span>}
 * />
 * ```
 */
export function OverflowContainer(props: OverflowContainerProps): JSX.Element {
  const view = {
    renderItem: props.renderItem,
    renderRest: props.renderRest,
    className: props.className,
    style: props.style,
  }

  if (props.strategy === 'canvas') {
    return (
      <CanvasOverflowContainer
        items={props.items}
        options={props.options}
        {...view}
      />
    )
  }

  return (
    <DomOverflowContainer
      items={props.items}
      options={props.options}
      {...view}
    />
  )
}

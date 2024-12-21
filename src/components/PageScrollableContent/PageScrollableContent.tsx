import classNames from 'classnames'

type Props = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  noPaddingTop?: boolean
}

export const PageScrollableContent = ({
  children,
  className,
  style,
  noPaddingTop
}: Props) => {
  const innerContentClassName = classNames('inner-content main-max-width', noPaddingTop ? 'no-padding-top' : '')

  return (
    <div className={className} style={style}>
      <div className={innerContentClassName}>{children}</div>
    </div>
  )
}

export const scrollToTopOfPageScrollableContent = () => {
  setTimeout(() => {
    const pageEl = document.querySelector('.page-scrollable-content')
    if (pageEl) pageEl.scrollTop = 0
  }, 0)
}

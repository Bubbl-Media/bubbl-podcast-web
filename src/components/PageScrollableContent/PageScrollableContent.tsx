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
  const containerClassName = classNames(
    'page-scrollable-content',
    className
  )
  
  const innerContentClassName = classNames(
    'inner-content',
    noPaddingTop ? 'no-padding-top' : ''
  )

  return (
    <div className={containerClassName} style={style}>
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

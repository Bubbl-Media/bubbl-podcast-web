import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PV } from '~/resources'
import { FeatureDemoWidget, PVLink } from '..'

interface ListProps {
  children: React.ReactNode
  handleSelectByCategory?: () => void
  handleShowAllPodcasts?: () => void
  hideNoResultsMessage?: boolean
  isSubscribedFilter?: boolean
  className?: string
}

export const List = ({
  children,
  handleSelectByCategory,
  handleShowAllPodcasts,
  hideNoResultsMessage,
  isSubscribedFilter,
  className
}: ListProps) => {
  const { t } = useTranslation()
  const hasChildren = children !== null && children !== undefined
  const showNoResultsFound = !hideNoResultsMessage && !hasChildren
  const listClass = classNames('list', className)

  const noResultsTextNode = isSubscribedFilter ? (
    <div className='no-results-found-message'>
      <p>{t('Not subscribed to any podcasts')}</p>
      <p>
        <PVLink href={PV.RoutePaths.web.search}>{t('Search')}</PVLink>
      </p>
      <p>
        <a onClick={handleSelectByCategory}>{t('Select by category')}</a>
      </p>
      <p>
        <a onClick={handleShowAllPodcasts}>{t('Show all podcasts')}</a>
      </p>
    </div>
  ) : (
    <div className='no-results-found-message' tabIndex={0}>
      {t('No results found')}
    </div>
  )

  return (
    <div className={listClass}>
      {showNoResultsFound && noResultsTextNode}
      {hasChildren && children}
    </div>
  )
}

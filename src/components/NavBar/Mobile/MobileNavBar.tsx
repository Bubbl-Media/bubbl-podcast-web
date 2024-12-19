import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { Icon, NavBarBrand, PVLink } from '~/components'
import { PV } from '~/resources'
import { eventNavBarLinkClicked } from '~/lib/utility/events'

type Props = unknown

export const MobileNavBar = (props: Props) => {
  const { t } = useTranslation()

  return (
    <div className='mobile-navbar'>
      <div className='left-wrapper'>
        <NavBarBrand href='https://bubbl.fm' />
      </div>
      <div className='right-wrapper'>
        <PVLink
          className='search-button'
          href={PV.RoutePaths.web.search}
          onClick={() => eventNavBarLinkClicked('search')}
        >
          <Icon faIcon={faSearch} />
        </PVLink>
      </div>
    </div>
  )
}

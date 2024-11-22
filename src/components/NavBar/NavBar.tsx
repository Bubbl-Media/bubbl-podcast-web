import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NavBarBrand, NavBarLink } from '~/components'
import { PV } from '~/resources'
import { eventNavBarLinkClicked } from '~/lib/utility/events'

type Props = unknown

export const NavBar = (props: Props) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <nav className='navbar' style={{ backgroundColor: '#04081A' }}>
      <NavBarBrand height={28} href={PV.RoutePaths.web.home} width={150} />
      <NavBarLink
        active={router.pathname == PV.RoutePaths.web.search}
        faIconBeginning={faSearch}
        href={PV.RoutePaths.web.search}
        onClick={() => eventNavBarLinkClicked('search')}
        text={t('Search')}
      />
      <hr aria-hidden='true' className='top' />
      <div className='scrollable-content'>
        <NavBarLink
          active={router.pathname == PV.RoutePaths.web.podcasts || router.pathname == PV.RoutePaths.web.home}
          href={PV.RoutePaths.web.podcasts}
          onClick={() => eventNavBarLinkClicked('podcasts')}
          text={t('Podcasts')}
        />
      </div>
    </nav>
  )
}

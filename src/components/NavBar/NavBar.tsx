import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NavBarBrand, NavBarLink, Icon } from '~/components'
import { PV } from '~/resources'
import { eventNavBarLinkClicked } from '~/lib/utility/events'

type Props = unknown

export const NavBar = (props: Props) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <nav className='navbar' style={{ backgroundColor: '#04081A', position: 'relative' }}>
      <NavBarBrand href={PV.RoutePaths.web.home} />
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
        <NavBarLink
          active={router.pathname == '/inbox'}
          href="https://bubbl.fm/inbox"
          onClick={() => eventNavBarLinkClicked('podcasts')}
          text={t('Bubbl Inbox')}
        />
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <a
          href="https://github.com/Bubbl-Media/bubbl-podcast-web"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#7FB5AA',
            fontSize: '24px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#9FD5CA'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#7FB5AA'}
        >
          <Icon faIcon={faGithub} />
        </a>
      </div>
    </nav>
  )
}

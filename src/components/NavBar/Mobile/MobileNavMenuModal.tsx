import { useRouter } from 'next/router'
import { useOmniAural } from 'omniaural'
import { useTranslation } from 'react-i18next'
import Modal from 'react-modal'
import { ButtonClose } from '~/components'
import { eventNavBarLinkClicked } from '~/lib/utility/events'
import { PV } from '~/resources'
import { OmniAuralState } from '~/state/omniauralState'
import { MobileNavMenuLink } from './MobileNavMenuLink'

type Props = {
  handleHideMenu: any
  show: boolean
}

export const MobileNavMenuModal = ({ handleHideMenu, show }: Props) => {
  const router = useRouter()
  const { t } = useTranslation()
  const [userInfo] = useOmniAural('session.userInfo') as [OmniAuralState['session']['userInfo']]

  return (
    <Modal
      className='mobile-nav-menu-modal'
      contentLabel={t('Navigation menu')}
      isOpen={show}
      onRequestClose={handleHideMenu}
      overlayClassName='mobile-nav-menu-modal-overlay'
    >
      <ButtonClose onClick={handleHideMenu} />
      <div className='scrollable-content'>
        <MobileNavMenuLink
          active={router.pathname == PV.RoutePaths.web.podcasts || router.pathname == PV.RoutePaths.web.home}
          handleHideMenu={handleHideMenu}
          href={PV.RoutePaths.web.podcasts}
          onClick={() => eventNavBarLinkClicked('podcasts')}
          text={t('Podcasts')}
        />
      </div>
    </Modal>
  )
}

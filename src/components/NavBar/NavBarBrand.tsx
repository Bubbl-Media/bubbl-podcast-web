import { useTranslation } from 'react-i18next'
import { PVLink } from '~/components'

type Props = {
  href: string
  target?: '_blank'
  className?: string
}

export function NavBarBrand({ 
  href,
  target,
  className
}: Props) {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      width: '100%'
    }}>
      <PVLink
        className={`navbar-brand ${className || ''}`}
        href={href}
        target={target}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ 
            color: '#7FB5AA',
            fontSize: '28px',
            fontWeight: 'bold',
            fontFamily: 'Prompt'
          }}>
            Bubbl
          </span>
          <img 
            src="/images/bubbl-icon.png"
            alt="Bubbl logo"
            style={{ 
              height: '40px',
              width: '40px',
              objectFit: 'contain' 
            }}
          />
        </div>
      </PVLink>
    </div>
  )
}

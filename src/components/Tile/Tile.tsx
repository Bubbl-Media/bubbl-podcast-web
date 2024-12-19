import { useTranslation } from 'react-i18next'

type TileProps = {
  onClick: () => void
  title: string
}

export const Tile = ({ title, onClick }: TileProps) => {
  return (
    <li 
      role='button' 
      tabIndex={0} 
      aria-label={title} 
      className='tile-box' 
      onClick={onClick}
    >
      <h1 
        aria-hidden='true' 
        className='tile-box-text'
        style={{ 
          fontFamily: 'Prompt',
          background: 'linear-gradient(45deg, #7FB5AA, #A8E6CF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {title}
      </h1>
    </li>
  )
}

type TileItem = {
  id: string
  title: string
}

type TilesProps = {
  groupAriaLabel?: string
  items: TileItem[]
  onClick: (id: string) => void
}

export const Tiles = ({ groupAriaLabel, items, onClick }: TilesProps) => {
  const tiles = items.map((item: TileItem) => (
    <Tile key={item.id} onClick={() => onClick(item.id)} title={item.title} />
  ))

  return (
    <ul aria-label={groupAriaLabel} className='tiles' tabIndex={0}>
      {tiles}
    </ul>
  )
}

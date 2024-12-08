import { NowPlayingItem } from 'podverse-shared'
import { ClientSideCookies } from './cookies'

// Import from serverSideTranslations instead
import type { SSRConfig } from 'next-i18next/dist/types/types'

export interface Page extends SSRConfig {
  serverUserInfo: any
  serverUserQueueItems: NowPlayingItem[]
  serverCookies: ClientSideCookies
  serverGlobalFilters: any
}

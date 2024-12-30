import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import OmniAural, { useOmniAural, useOmniAuralEffect } from 'omniaural'
import type { Podcast } from 'podverse-shared'
import { useEffect, useRef, useState } from 'react'
import { WaveBackground } from '~/components'
import { useCookies } from 'react-cookie'
import {
  List,
  MessageWithAction,
  Meta,
  PageHeader,
  PageScrollableContent,
  Pagination,
  PodcastListItem,
  scrollToTopOfPageScrollableContent,
  SearchBarFilter,
  Tiles
} from '~/components'
import { Page } from '~/lib/utility/page'
import { determinePageCount } from '~/lib/utility/pagination'
import { PV } from '~/resources'
import { isNotAllSortOption } from '~/resources/Filters'
import { getCategoryById, getCategoryBySlug, getTranslatedCategories } from '~/services/category'
import { getPodcastsByQuery, getPodcastById } from '~/services/podcast'
import { getDefaultServerSideProps } from '~/services/serverSideHelpers'
import { OmniAuralState } from '~/state/omniauralState'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface ServerProps extends Page {
  serverCategoryId: string | null
  serverCookies: any
  serverFilterFrom: string
  serverFilterPage: number
  serverFilterSort: string
  serverIsHomePage: boolean
  serverPodcastsListData: Podcast[]
  serverPodcastsListDataCount: number
}

const keyPrefix = 'pages_podcasts'

const NavArrows = () => (
  <div className="flex items-center gap-2 fixed top-4 left-4 z-50 md:relative md:top-0 md:left-0">
    <button 
      onClick={() => window.history.back()} 
      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/50 backdrop-blur-sm border border-teal-500/20 hover:bg-slate-800/50"
      aria-label="Go back"
    >
      <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button 
      onClick={() => window.history.forward()}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/50 backdrop-blur-sm border border-teal-500/20 hover:bg-slate-800/50"
      aria-label="Go forward"
    >
      <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
)

export default function Podcasts({
  serverCategoryId,
  serverCookies,
  serverFilterFrom,
  serverFilterPage,
  serverFilterSort,
  serverGlobalFilters,
  serverIsHomePage,
  serverPodcastsListData,
  serverPodcastsListDataCount
}: ServerProps) {
  /* Initialize */
  const router = useRouter()
  const { t } = useTranslation()
  const [cookies, setCookie] = useCookies([])

  const [filterQuery, setFilterQuery] = useState<any>({
    filterCategoryId: serverCategoryId || null,
    filterFrom: PV.Filters.from._all,
    filterPage: serverFilterPage,
    filterSearchText: '',
    filterSort: serverFilterSort,
    videoOnlyMode: serverGlobalFilters?.videoOnlyMode || OmniAural.state.globalFilters.videoOnlyMode.value()
  })
  const { filterCategoryId, filterFrom, filterPage, filterSearchText, filterSort, videoOnlyMode } = filterQuery
  const [tempFilterQuery, setTempFilterQuery] = useState<any>({
    tempFilterEnabled: false,
    tempFilterFrom: serverFilterFrom,
    tempFilterSort: serverFilterSort
  })
  const { tempFilterEnabled, tempFilterFrom, tempFilterSort } = tempFilterQuery

  const [podcastsListData, setPodcastsListData] = useState<Podcast[]>(serverPodcastsListData)
  const [podcastsListDataCount, setPodcastsListDataCount] = useState<number>(serverPodcastsListDataCount)
  const [isQuerying, setIsQuerying] = useState<boolean>(false)
  const [userInfo] = useOmniAural('session.userInfo') as [OmniAuralState['session']['userInfo']]
  const initialRender = useRef(true)
  const pageCount = determinePageCount(filterPage, podcastsListData, podcastsListDataCount, !!filterSearchText)
  const isCategoryPage = !!router.query?.category
  const isCategoriesPage = filterFrom === PV.Filters.from._category && !isCategoryPage
  const selectedCategory = isCategoryPage ? getCategoryById(filterCategoryId) : null
  const pageHeaderText = selectedCategory ? selectedCategory.title : ''

  const categories = getTranslatedCategories(t)

  const [localSubscriptions, setLocalSubscriptions] = useState<string[]>([])
  const [showLoginIframe, setShowLoginIframe] = useState(false)
  console.log('Initial showLoginIframe state:', showLoginIframe)

  /* useEffects */

  const handleEffect = () => {
    ;(async () => {
      try {
        if (!initialRender.current) {
          OmniAural.pageIsLoadingShow()
          setIsQuerying(true)
        }
        
        initialRender.current = false
        console.log('9. Calling clientQueryPodcasts...')
        const response = await clientQueryPodcasts()
        console.log('10. Response from clientQueryPodcasts:', response)
        console.log('11. Response.data:', response.data)

        if (filterFrom === 'subscribed') {
          const [podcasts, count] = response.data
          console.log('12. Extracted podcasts:', podcasts)
          console.log('13. Count:', count)
          setPodcastsListData(podcasts)
          setPodcastsListDataCount(count)
        } else {
          const [newListData, newListCount] = response.data
          setPodcastsListData(newListData)
          setPodcastsListDataCount(newListCount)
        }
        
      } catch (err) {
        console.log('14. Error in handleEffect:', err)
      }

      OmniAural.pageIsLoadingHide()
      setIsQuerying(false)
      scrollToTopOfPageScrollableContent()
    })()
  }

  useOmniAuralEffect(() => {
    const newStateVal = OmniAural.state.globalFilters.videoOnlyMode.value()
    setFilterQuery({
      ...filterQuery,
      videoOnlyMode: newStateVal
    })

    const globalFilters = cookies.globalFilters || {}
    setCookie(
      'globalFilters',
      {
        ...globalFilters,
        videoOnlyMode: newStateVal
      },
      { path: PV.Cookies.path }
    )
  }, 'globalFilters.videoOnlyMode')

  useEffect(() => {
    window.addEventListener('navbar-link-clicked-podcasts', _handleSearchClear)
    return () => window.removeEventListener('navbar-link-clicked-podcasts', _handleSearchClear)
  }, [])

  useEffect(() => {
    console.log('Filter query changed:', filterQuery)
    handleEffect()
  }, [filterQuery])

  useEffect(() => {
    const localSubs = localStorage.getItem('localSubscriptions')
    if (localSubs) {
      try {
        const parsedSubs = JSON.parse(localSubs)
        setLocalSubscriptions(parsedSubs)
      } catch (e) {
        console.error('Error parsing local subscriptions:', e)
      }
    }
  }, [])

  useEffect(() => {
    console.log('=== State Change Debug ===')
    console.log('showLoginIframe changed to:', showLoginIframe)
  }, [showLoginIframe])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from bubbl.fm
      if (!event.origin.includes('bubbl.fm') && !event.origin.includes('localhost')) {
        return
      }

      if (event.data?.type === 'LOGIN_SUCCESS') {
        console.log('Login successful, closing iframe')
        setShowLoginIframe(false)
        window.location.reload()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  /* Client-Side Queries */

  const clientQueryPodcasts = async () => {
    if (filterFrom === 'subscribed') {
      // 1. Get the ID from localStorage
      const localSubs = localStorage.getItem('localSubscriptions')
      const podcastId = localSubs ? JSON.parse(localSubs)[0] : null // Get the first (and only) ID
      
      if (!podcastId) {
        return { data: [[], 0] }
      }

      // 2. Query Podverse with JUST THIS ID
      const response = await getPodcastById(podcastId)  // Use getPodcastById instead of getPodcastsByQuery

      // 3. Return in the format the UI expects
      return { data: [[response.data], 1] }
    }

    // Handle other cases as before
    if (filterFrom === PV.Filters.from._category) {
      return clientQueryPodcastsByCategory()
    } else {
      return clientQueryPodcastsAll()
    }
  }

  const clientQueryPodcastsAll = async () => {
    const finalQuery = {
      ...(filterPage ? { page: filterPage } : {}),
      ...(filterSearchText ? { searchText: filterSearchText } : {}),
      ...(filterSearchText ? { searchBy: PV.Filters.search.queryParams.podcast } : {}),
      ...(filterSort ? { sort: filterSort } : {}),
      ...(videoOnlyMode ? { hasVideo: true } : {})
    }

    return getPodcastsByQuery(finalQuery)
  }

  const clientQueryPodcastsByCategory = async () => {
    const finalQuery = {
      categories: filterCategoryId ? [filterCategoryId] : [],
      ...(filterPage ? { page: filterPage } : {}),
      ...(filterSearchText ? { searchText: filterSearchText } : {}),
      ...(filterSort ? { sort: filterSort } : {}),
      ...(videoOnlyMode ? { hasVideo: true } : {})
    }

    return getPodcastsByQuery(finalQuery)
  }

  /* Function Helpers */

  const _handlePrimaryOnChange = async (selectedItems: any[]) => {
    console.log('_handlePrimaryOnChange called with:', selectedItems)
    const selectedItem = selectedItems[0]
    
    if (selectedItem.key === 'subscribed') {
      // Get local subscriptions
      const localSubs = localStorage.getItem('localSubscriptions')
      const podcastIds = localSubs ? JSON.parse(localSubs) : []
      
      console.log('Local subscriptions:', podcastIds)
      
      // If no subscriptions, show empty state
      if (!podcastIds.length) {
        setPodcastsListData([])
        setPodcastsListDataCount(0)
        return
      }

      // Query using specific podcast IDs instead of subscribed flag
      try {
        const response = await getPodcastsByQuery({
          podcastIds, // Use this instead of subscribed: true
          page: filterPage || 1,
          sort: 'most-recent',
          ...(videoOnlyMode ? { hasVideo: true } : {})
        })
        
        console.log('Subscribed podcasts response:', response)
        
      } catch (error) {
        console.error('Error fetching subscribed podcasts:', error)
      }
    }

    setFilterQuery({
      ...filterQuery,
      filterCategoryId: null,
      filterFrom: selectedItem.key,
      filterPage: 1,
      filterSort: selectedItem.key === 'subscribed' 
        ? 'most-recent'
        : 'top-past-week'
    })
  }

  const _handleSortOnChange = (selectedItems: any[]) => {
    const selectedItem = selectedItems[0]
    let newPage = filterPage
    if (selectedItem.key !== filterSort) newPage = 1
    setFilterQuery({
      ...filterQuery,
      filterSort: selectedItem.key,
      filterPage: newPage
    })
  }

  const _handleSearchSubmit = async (val: string) => {
    if (!tempFilterEnabled && val) {
      setTempFilterQuery({
        tempFilterEnabled: true,
        tempFilterFrom: filterFrom,
        tempFilterSort: filterSort
      })
      setFilterQuery({
        ...filterQuery,
        filterCategoryId: null,
        filterFrom: PV.Filters.from._all,
        filterPage: 1,
        filterSearchText: val,
        filterSort: PV.Filters.sort._topPastWeek
      })
    } else if (tempFilterEnabled && !val) {
      setTempFilterQuery({
        ...tempFilterQuery,
        tempFilterEnabled: false
      })
      setFilterQuery({
        ...filterQuery,
        filterFrom: tempFilterFrom,
        filterPage: 1,
        filterSearchText: val,
        filterSort: tempFilterSort
      })
    } else {
      setFilterQuery({
        ...filterQuery,
        filterCategoryId,
        filterPage: 1,
        filterSearchText: val
      })
    }
  }

  const _handleSearchClear = () => {
    _handleSearchSubmit('')
  }

  /* Render Helpers */

  const generatePodcastListElements = (listItems: Podcast[]) => {
    return listItems.map((listItem, index) => (
      <PodcastListItem key={`${keyPrefix}-${index}-${listItem?.id}`} podcast={listItem} serverCookies={serverCookies} />
    ))
  }

  /* Meta Tags */

  const meta = {
    currentUrl: serverIsHomePage ? PV.Config.WEB_BASE_URL : `${PV.Config.WEB_BASE_URL}${PV.RoutePaths.web.podcasts}`,
    description: t('Listen to your favorite podcasts with Bubbl FM'),
    title: serverIsHomePage ? t('Bubbl FM') : t('Bubbl FM - Podcasts')
  }

  return (
    <div className="flex flex-col h-screen">
      <Meta {...meta} />
      
      {/* Background */}
      <div className="fixed inset-0" style={{ zIndex: -1 }}>
        <WaveBackground />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-grow h-full">
        <div className="flex items-center justify-between p-4">
          <NavArrows />
          <h1 className="text-4xl font-bold absolute left-1/2 transform -translate-x-1/2">Podcasts</h1>
          {/* Your filter dropdowns */}
        </div>
        
        <PageHeader
          noMarginBottom={
            (filterFrom !== PV.Filters.from._category && !!podcastsListDataCount) ||
            (isCategoryPage && filterFrom === PV.Filters.from._category)
          }
          primaryOnChange={_handlePrimaryOnChange}
          primaryOptions={PV.Filters.dropdownOptions.podcasts.from}
          primarySelected={filterFrom}
          secondaryOnChange={_handleSortOnChange}
          secondaryOptions={
            filterFrom === PV.Filters.from._subscribed
              ? PV.Filters.dropdownOptions.podcasts.sort.subscribed
              : PV.Filters.dropdownOptions.podcasts.sort.all
          }
          secondarySelected={filterSort}
          text={pageHeaderText}
          videoOnlyMode={videoOnlyMode}
          dropdownStyle={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            maxWidth: '200px',
            backgroundColor: 'rgba(4, 8, 26, 0.7)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            marginTop: '4px'
          }}
        />
        <PageScrollableContent className="flex-grow">
          <div className="space-y-4">
            {!isCategoryPage && (
              <SearchBarFilter
                eventType='podcasts'
                handleClear={_handleSearchClear}
                handleSubmit={_handleSearchSubmit}
                includeBottomPadding={isCategoriesPage}
                placeholder={t('Search podcasts')}
                rounded={true}
                wrapperClassName="bg-slate-900/50"
                containerClassName="bg-slate-900/50"
              />
            )}
            {isCategoriesPage && (
              <Tiles
                groupAriaLabel={t('Categories')}
                items={categories}
                onClick={(id: string) => {
                  setFilterQuery({
                    ...filterQuery,
                    filterCategoryId: id,
                    filterPage: 1
                  })
                  const selectedCategory = getCategoryById(id)
                  router.push(`${PV.RoutePaths.web.podcasts}?category=${selectedCategory.slug}`)
                }}
              />
            )}
            {(filterFrom === PV.Filters.from._subscribed || filterFrom === PV.Filters.from._all || isCategoryPage) && (
              <>
                <List
                  handleSelectByCategory={() => _handlePrimaryOnChange([PV.Filters.dropdownOptions.podcasts.from[2]])}
                  handleShowAllPodcasts={() => _handlePrimaryOnChange([PV.Filters.dropdownOptions.podcasts.from[0]])}
                  hideNoResultsMessage={isQuerying}
                  isSubscribedFilter={
                    filterFrom === PV.Filters.from._subscribed && 
                    (userInfo?.subscribedPodcastIds?.length === 0 && localSubscriptions.length === 0)
                  }
                  className="space-y-2 bg-transparent"
                >
                  {podcastsListData.map((podcast, index) => (
                    <div key={`${keyPrefix}-${index}-${podcast?.id}`} 
                      className="bg-slate-900/50 backdrop-blur-sm rounded-lg"
                    >
                      <PodcastListItem 
                        podcast={podcast} 
                        serverCookies={serverCookies}
                      />
                    </div>
                  ))}
                </List>
                <Pagination
                  currentPageIndex={filterPage}
                  handlePageNavigate={(newPage) =>
                    setFilterQuery({
                      ...filterQuery,
                      filterPage: newPage
                    })
                  }
                  handlePageNext={() => {
                    if (filterPage + 1 <= pageCount)
                      setFilterQuery({
                        ...filterQuery,
                        filterPage: filterPage + 1
                      })
                  }}
                  handlePagePrevious={() => {
                    if (filterPage - 1 > 0)
                      setFilterQuery({
                        ...filterQuery,
                        filterPage: filterPage - 1
                      })
                  }}
                  pageCount={pageCount}
                  show={pageCount > 1}
                />
              </>
            )}
          </div>
        </PageScrollableContent>
      </div>
    </div>
  )
}

/* Server-Side Logic */

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale, query } = ctx
  const i18nProps = await serverSideTranslations(locale, ['common'])
  const { category: categorySlug } = query
  const selectedCategory = getCategoryBySlug(categorySlug as string)
  const serverCategoryId = selectedCategory?.id || null
  const defaultServerProps = await getDefaultServerSideProps(ctx, locale)
  const { serverGlobalFilters } = defaultServerProps

  // Always default to _all unless there's a specific category
  const serverFilterFrom = selectedCategory ? PV.Filters.from._category : PV.Filters.from._all
  const serverFilterSort = PV.Filters.sort._topPastWeek

  let podcastsListData = []
  let podcastsListDataCount = 0

  // Default query for all podcasts
  const response = await getPodcastsByQuery({
    ...(selectedCategory ? { categories: [serverCategoryId] } : {}),
    sort: serverFilterSort,
    hasVideo: serverGlobalFilters.videoOnlyMode
  })
  
  podcastsListData = response.data[0]
  podcastsListDataCount = response.data[1]

  const serverProps: ServerProps = {
    ...defaultServerProps,
    ...i18nProps,
    serverCategoryId,
    serverFilterFrom,
    serverFilterPage: 1,
    serverFilterSort,
    serverIsHomePage: false,
    serverPodcastsListData: podcastsListData,
    serverPodcastsListDataCount: podcastsListDataCount
  }

  return { props: serverProps }
}

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
import { getPodcastsByQuery } from '~/services/podcast'
import { getDefaultServerSideProps } from '~/services/serverSideHelpers'
import { OmniAuralState } from '~/state/omniauralState'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getFirebaseApp } from '../src/services/firebase'
import { 
  collection, 
  doc, 
  writeBatch, 
  getDocs, 
  query 
} from 'firebase/firestore'

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
  const pageHeaderText = selectedCategory ? `${t('Podcasts')} > ${selectedCategory.title}` : t('Podcasts')

  const categories = getTranslatedCategories(t)

  const [localSubscriptions, setLocalSubscriptions] = useState<string[]>([])
  const [showLoginIframe, setShowLoginIframe] = useState(false)
  console.log('Initial showLoginIframe state:', showLoginIframe)

  // Add this state to track bubbl.fm auth status
  const [isBubblFmAuthenticated, setIsBubblFmAuthenticated] = useState<boolean>(false)

  /* useEffects */

  const handleEffect = () => {
    ;(async () => {
      try {
        if (!initialRender.current) {
          OmniAural.pageIsLoadingShow()
          setIsQuerying(true)
        }
        
        initialRender.current = false
        const { data } = await clientQueryPodcasts()
        const [newListData, newListCount] = data
        setPodcastsListData(newListData)
        setPodcastsListDataCount(newListCount)
        
      } catch (err) {
        console.log(err)
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
    const handleMessage = async (event: MessageEvent) => {
      console.log('=== Message Handler Debug ===')
      
      // Ignore React DevTools
      if (event.data?.source === 'react-devtools-bridge') return
      
      console.log('Processing message:', event.data)
      console.log('Current iframe state:', showLoginIframe)

      if (event.data === '!_{"h":""}' || event.data?.type === 'LOGIN_SUCCESS') {
        console.log('Login success detected')
        setShowLoginIframe(false)
        
        // Add delay to verify state change
        setTimeout(() => {
          console.log('Delayed state check:', showLoginIframe)
        }, 100)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [showLoginIframe]) // Keep showLoginIframe in dependencies

  const syncSubscriptionsToFirebase = async (userId: string) => {
    try {
      const { db } = await getFirebaseApp()
      const batch = writeBatch(db)
      
      localSubscriptions.forEach(podcastId => {
        const userSubsRef = collection(db, 'users', userId, 'podcast_subscriptions')
        const subDoc = doc(userSubsRef, podcastId)
        batch.set(subDoc, {
          podcastId,
          createdAt: new Date()
        })
      })

      await batch.commit()

      localStorage.removeItem('localSubscriptions')
      setLocalSubscriptions([])
    } catch (error) {
      console.error('Error syncing subscriptions:', error)
    }
  }

  /* Client-Side Queries */

  const clientQueryPodcasts = async () => {
    if (filterFrom === PV.Filters.from._all) {
      return clientQueryPodcastsAll()
    } else if (filterFrom === PV.Filters.from._category) {
      return clientQueryPodcastsByCategory()
    } else if (filterFrom === PV.Filters.from._subscribed) {
      return clientQueryPodcastsBySubscribed()
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

  const clientQueryPodcastsBySubscribed = async () => {
    try {
      const { auth, db } = await getFirebaseApp()
      const currentUser = auth.currentUser

      if (currentUser) {
        // Get subscriptions from Firebase
        const userSubsRef = collection(db, 'users', currentUser.uid, 'podcast_subscriptions')
        const subsSnapshot = await getDocs(query(userSubsRef))
        
        const podcastIds = subsSnapshot.docs.map(doc => doc.id)
        
        if (podcastIds.length === 0) {
          return { data: [[], 0] } // Return empty result if no subscriptions
        }

        return getPodcastsByQuery({
          ids: podcastIds,
          ...(filterPage ? { page: filterPage } : {}),
          ...(filterSearchText ? { searchText: filterSearchText } : {}),
          ...(filterSort ? { sort: filterSort } : {}),
          ...(videoOnlyMode ? { hasVideo: true } : {})
        })
      } else {
        // Use local subscriptions for non-logged-in users
        if (localSubscriptions.length === 0) {
          return { data: [[], 0] }
        }

        return getPodcastsByQuery({
          ids: localSubscriptions,
          ...(filterPage ? { page: filterPage } : {}),
          ...(filterSearchText ? { searchText: filterSearchText } : {}),
          ...(filterSort ? { sort: filterSort } : {}),
          ...(videoOnlyMode ? { hasVideo: true } : {})
        })
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return { data: [[], 0] }
    }
  }

  /* Function Helpers */

  const checkBubblFmAuth = async () => {
    try {
      const { auth } = await getFirebaseApp()
      const currentUser = auth.currentUser
      
      if (!currentUser) {
        setIsBubblFmAuthenticated(false)
        return
      }

      const token = await currentUser.getIdToken()
      const bubblFmOrigin = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : 'https://bubbl.fm'

      const response = await fetch(`${bubblFmOrigin}/api/auth-check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.type === 'AUTH_STATUS') {
        setIsBubblFmAuthenticated(data.isAuthenticated)
        
        if (!data.isAuthenticated) {
          setShowLoginIframe(true)
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsBubblFmAuthenticated(false)
      setShowLoginIframe(true)
    }
  }

  const _handlePrimaryOnChange = async (selectedItems: any[]) => {
    const selectedItem = selectedItems[0]
    
    if (selectedItem.key === PV.Filters.from._subscribed) {
      await checkBubblFmAuth()
      
      if (!isBubblFmAuthenticated) {
        return // Stop here if not authenticated
      }
    }

    setFilterQuery({
      ...filterQuery,
      filterCategoryId: null,
      filterFrom: selectedItem.key,
      filterPage: 1,
      filterSort: selectedItem.key === PV.Filters.from._subscribed 
        ? PV.Filters.sort._mostRecent 
        : PV.Filters.sort._topPastWeek
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
          <h1 className="text-4xl font-light">Podcasts</h1>
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

      {/* Login iframe */}
      {showLoginIframe && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '90%',
            maxWidth: '600px',
            height: '80vh',
            backgroundColor: '#04081A',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <iframe
              src={process.env.NODE_ENV === 'development' 
                ? "http://localhost:3000/login"
                : "https://bubbl.fm/login"
              }
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </div>
        </div>
      )}
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

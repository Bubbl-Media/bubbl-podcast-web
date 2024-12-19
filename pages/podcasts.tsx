import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import OmniAural, { useOmniAural, useOmniAuralEffect } from 'omniaural'
import type { Podcast } from 'podverse-shared'
import { useEffect, useRef, useState } from 'react'
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
    filterFrom: serverFilterFrom,
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

  /* useEffects */

  const handleEffect = () => {
    ;(async () => {
      try {
        if (initialRender.current) {
          initialRender.current = false
        } else {
          OmniAural.pageIsLoadingShow()
          setIsQuerying(true)

          const { data } = await clientQueryPodcasts()
          const [newListData, newListCount] = data
          setPodcastsListData(newListData)
          setPodcastsListDataCount(newListCount)
        }
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
    const handleMessage = (event: MessageEvent) => {
      // Make sure message is from bubbl.fm
      if (event.origin !== "https://bubbl.fm") return;
      
      // Check if the message indicates successful login
      if (event.data?.type === "LOGIN_SUCCESS") {
        setShowLoginIframe(false)
        
        // Update filter query to show subscribed podcasts
        setFilterQuery({
          ...filterQuery,
          filterCategoryId: null,
          filterFrom: PV.Filters.from._subscribed,
          filterPage: 1,
          filterSort: PV.Filters.sort._mostRecent
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [filterQuery])

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
    return getPodcastsByQuery({
      subscribed: true,
      maxResults: true
    })
  }

  /* Function Helpers */

  const _handlePrimaryOnChange = (selectedItems: any[]) => {
    const selectedItem = selectedItems[0]
    
    if (selectedItem.key === PV.Filters.from._subscribed) {
      setShowLoginIframe(true)
      return
    }

    router.push(`${PV.RoutePaths.web.podcasts}`)
    let newPage = filterPage
    let newSort = filterSort
    if (selectedItem.key !== filterFrom) newPage = 1

    if (selectedItem.key !== PV.Filters.from._subscribed && isNotAllSortOption(filterSort)) {
      newSort = PV.Filters.sort._topPastWeek
    }

    setFilterQuery({
      ...filterQuery,
      filterCategoryId: null,
      filterFrom: selectedItem.key,
      filterPage: newPage,
      filterSort: newSort
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
    <>
      <Meta
        description={meta.description}
        ogDescription={meta.description}
        ogTitle={meta.title}
        ogType='website'
        ogUrl={meta.currentUrl}
        robotsNoIndex={false}
        title={meta.title}
        twitterDescription={meta.description}
        twitterTitle={meta.title}
      />
      <div style={{ 
        backgroundColor: '#04081A',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
        />
        <PageScrollableContent 
          noPaddingTop={isCategoryPage}
        >
          {!isCategoryPage && (
            <SearchBarFilter
              eventType='podcasts'
              handleClear={_handleSearchClear}
              handleSubmit={_handleSearchSubmit}
              includeBottomPadding={isCategoriesPage}
              placeholder={t('Search podcasts')}
              rounded={true}
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
              >
                {generatePodcastListElements(podcastsListData)}
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
        </PageScrollableContent>
        
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
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <button 
                onClick={() => setShowLoginIframe(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 1001,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#000'
                }}
              >
                ×
              </button>
              <iframe
                src="https://bubbl.fm/login"
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
    </>
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
  const { serverGlobalFilters, serverUserInfo } = defaultServerProps

  const serverFilterFrom = serverUserInfo && !selectedCategory ? PV.Filters.from._subscribed : PV.Filters.from._category
  const serverFilterSort =
    serverUserInfo && !selectedCategory ? PV.Filters.sort._mostRecent : PV.Filters.sort._topPastWeek

  const serverFilterPage = 1

  let podcastsListData = []
  let podcastsListDataCount = 0
  
  if (selectedCategory) {
    const response = await getPodcastsByQuery({
      categories: [serverCategoryId],
      sort: serverFilterSort,
      hasVideo: serverGlobalFilters.videoOnlyMode
    })
    podcastsListData = response.data[0]
    podcastsListDataCount = response.data[1]
  } else if (serverFilterFrom === PV.Filters.from._subscribed) {
    // We can't access localStorage on server, so just return empty array
    // The client-side query will handle both user and local subscriptions
    podcastsListData = []
    podcastsListDataCount = 0
  }

  const serverProps: ServerProps = {
    ...defaultServerProps,
    ...i18nProps,
    serverCategoryId,
    serverFilterFrom,
    serverFilterPage,
    serverFilterSort,
    serverIsHomePage: false,
    serverPodcastsListData: podcastsListData,
    serverPodcastsListDataCount: podcastsListDataCount
  }

  return { props: serverProps }
}

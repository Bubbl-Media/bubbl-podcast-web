import { PV } from '~/resources'
import { request } from '~/services/request'

type PodcastQueryParams = {
  categories?: string[]
  hasVideo?: boolean
  maxResults?: boolean
  page?: number
  ids?: string[]
  searchBy?: string
  searchText?: string
  sort?: string
  subscribed?: boolean
}

export const getPodcastsByQuery = async ({
  categories,
  hasVideo,
  maxResults,
  page,
  ids,
  searchBy,
  searchText,
  sort,
  subscribed
}: PodcastQueryParams) => {
  if (ids?.length === 0) {
    return { data: [[], 0] }
  }

  const filteredQuery: PodcastQueryParams = {
    ...(ids ? { ids } : {}),
    ...(categories ? { categories } : {}),
    ...(hasVideo ? { hasVideo } : {}),
    ...(maxResults ? { maxResults: true } : {}),
    ...(page ? { page } : { page: 1 }),
    ...(searchBy === PV.Filters.search.queryParams.podcast ? { searchTitle: encodeURIComponent(searchText) } : {}),
    ...(searchBy === PV.Filters.search.queryParams.host ? { searchAuthor: encodeURIComponent(searchText) } : {}),
    ...(sort ? { sort } : {}),
    ...(subscribed ? { subscribed: true } : {})
  }

  const endpoint = PV.RoutePaths.api.podcast

  const response = await request({
    endpoint,
    method: 'get',
    query: filteredQuery
  })

  return response
}

export const getPodcastById = async (id: string) => {
  return request({
    endpoint: `${PV.RoutePaths.api.podcast}/${id}`
  })
}

import { PV } from '~/resources'
import { request } from '~/services/request'

type PodcastQueryParams = {
  categories?: string[]
  hasVideo?: boolean
  maxResults?: boolean
  page?: number
  ids?: string[]
  podcastIds?: string[]
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
  podcastIds,
  searchBy,
  searchText,
  sort,
  subscribed
}: PodcastQueryParams) => {

  if (ids?.length) {
    return request({
      endpoint: PV.RoutePaths.api.podcast,
      method: 'get',
      query: { ids }
    })
  }

  const query = {
    ...(subscribed ? { subscribed: true } : {}),
    ...(podcastIds ? { ids: podcastIds } : {}),
    ...(categories ? { categories } : {}),
    ...(hasVideo ? { hasVideo } : {}),
    ...(maxResults ? { maxResults: true } : {}),
    ...(page ? { page } : { page: 1 }),
    ...(searchBy === PV.Filters.search.queryParams.podcast ? { searchTitle: encodeURIComponent(searchText) } : {}),
    ...(searchBy === PV.Filters.search.queryParams.host ? { searchAuthor: encodeURIComponent(searchText) } : {}),
    ...(sort ? { sort } : {})
  }

  return request({
    endpoint: PV.RoutePaths.api.podcast,
    method: 'get',
    query
  })
}

export const getPodcastById = async (id: string) => {
  return request({
    endpoint: `${PV.RoutePaths.api.podcast}/${id}`
  })
}

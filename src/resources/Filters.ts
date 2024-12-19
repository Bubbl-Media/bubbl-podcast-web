const _all = 'all'
const _category = 'category'
const _episode = 'episode'
const _podcast = 'podcast'
const _subscribed = 'subscribed'

const _host = 'host'

const _alphabetical = 'alphabetical'
const _chronological = 'chronological'
const _mostRecent = 'most-recent'
const _oldest = 'oldest'
const _random = 'random'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'
const _topAllTime = 'top-all-time'

const _chapters = 'chapters'
const _clips = 'clips'
const _episodes = 'episodes'
const _myClips = 'my-clips'
const _myPlaylists = 'my-playlists'
const _playlists = 'playlists'
const _podcasts = 'podcasts'

const _liveNow = 'live'
const _liveScheduled = 'pending'

type DropdownOption = {
  i18nKey?: string
  i18nAriaLabelKey?: string
  key: string
  label?: string
}

export const isNotAllSortOption = (selectedKey: string) => {
  const allowedKeys = Filters.dropdownOptions.podcasts.sort.all
  return !allowedKeys.find((option: DropdownOption) => option.key === selectedKey)
}

export const isNotPodcastsSubscribedSortOption = (selectedKey: string) => {
  const allowedKeys = Filters.dropdownOptions.podcasts.sort.subscribed
  return !allowedKeys.find((option: DropdownOption) => option.key === selectedKey)
}

export const isNotClipsSortOption = (selectedKey: string) => {
  const allowedKeys = Filters.dropdownOptions.clips.sort.subscribed
  return !allowedKeys.find((option: DropdownOption) => option.key === selectedKey)
}

export const Filters = {
  from: {
    _all,
    _category,
    _episode,
    _podcast,
    _subscribed
  },
  search: {
    queryParams: {
      host: _host,
      podcast: _podcast
    }
  },
  sort: {
    _alphabetical,
    _chronological,
    _mostRecent,
    _oldest,
    _random,
    _topPastDay,
    _topPastWeek,
    _topPastMonth,
    _topPastYear,
    _topAllTime
  },
  type: {
    _chapters,
    _clips,
    _episodes,
    _myClips,
    _myPlaylists,
    _playlists,
    _podcasts
  },
  dropdownOptions: {
    clip: {
      sort: [
        { i18nKey: 'Recent', key: _mostRecent },
        { i18nKey: 'Top — Past Day', key: _topPastDay },
        { i18nKey: 'Top — Past Week', key: _topPastWeek },
        { i18nKey: 'Top — Past Month', key: _topPastMonth },
        { i18nKey: 'Top — Past Year', key: _topPastYear },
        { i18nKey: 'Top — All Time', key: _topAllTime },
        { i18nKey: 'Oldest', key: _oldest },
        { i18nKey: 'Random', key: _random }
      ]
    },
    clips: {
      from: [
        { i18nKey: 'All', i18nAriaLabelKey: 'All', key: _all },
        { i18nKey: 'Subscribed', i18nAriaLabelKey: 'Subscribed', key: _subscribed },
        { i18nKey: 'Category', i18nAriaLabelKey: 'Category', key: _category }
      ],
      sort: {
        all: [
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime }
        ],
        subscribed: [
          { i18nKey: 'Recent', key: _mostRecent },
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime },
          { i18nKey: 'Oldest', key: _oldest }
        ]
      }
    },
    episode: {
      sort: [
        { i18nKey: 'Recent', key: _mostRecent },
        { i18nKey: 'Top — Past Day', key: _topPastDay },
        { i18nKey: 'Top — Past Week', key: _topPastWeek },
        { i18nKey: 'Top — Past Month', key: _topPastMonth },
        { i18nKey: 'Top — Past Year', key: _topPastYear },
        { i18nKey: 'Top — All Time', key: _topAllTime },
        { i18nKey: 'Oldest', key: _oldest },
        { i18nKey: 'Random', key: _random }
      ]
    },
    episodes: {
      from: [
        { i18nKey: 'All', key: _all },
        { i18nKey: 'Subscribed', key: _subscribed },
        { i18nKey: 'Category', key: _category }
      ],
      sort: {
        all: [
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime }
        ],
        subscribed: [
          { i18nKey: 'Recent', key: _mostRecent },
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime }
        ]
      }
    },
    livestreams: {
      from: [
        { i18nKey: 'All', key: _all },
        { i18nKey: 'Subscribed', key: _subscribed },
        { i18nKey: 'Category', key: _category }
      ],
      status: [
        { i18nKey: 'Live now', key: _liveNow },
        { i18nKey: 'Scheduled', key: _liveScheduled }
      ]
    },
    podcast: {
      from: [
        { i18nKey: 'Episodes', key: _episodes },
        { i18nKey: 'Clips', key: _clips }
      ],
      sort: [
        { i18nKey: 'Recent', key: _mostRecent },
        { i18nKey: 'Top — Past Day', key: _topPastDay },
        { i18nKey: 'Top — Past Week', key: _topPastWeek },
        { i18nKey: 'Top — Past Month', key: _topPastMonth },
        { i18nKey: 'Top — Past Year', key: _topPastYear },
        { i18nKey: 'Top — All Time', key: _topAllTime },
        { i18nKey: 'Oldest', key: _oldest },
        { i18nKey: 'Random', key: _random }
      ]
    },
    podcasts: {
      from: [
        { i18nKey: 'All', key: _all },
        { i18nKey: 'Subscribed', key: _subscribed },
        { i18nKey: 'Category', key: _category }
      ],
      sort: {
        all: [
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime }
        ],
        subscribed: [
          { i18nKey: 'Alphabetical', key: _alphabetical },
          { i18nKey: 'Recent', key: _mostRecent },
          { i18nKey: 'Top — Past Day', key: _topPastDay },
          { i18nKey: 'Top — Past Week', key: _topPastWeek },
          { i18nKey: 'Top — Past Month', key: _topPastMonth },
          { i18nKey: 'Top — Past Year', key: _topPastYear },
          { i18nKey: 'Top — All Time', key: _topAllTime },
          { i18nKey: 'Oldest', key: _oldest }
        ]
      }
    },
    profile: {
      types: [
        { i18nKey: 'Podcasts', key: _podcasts },
        { i18nKey: 'Clips', key: _clips },
        { i18nKey: 'Playlists', key: _playlists }
      ]
    }
  }
}

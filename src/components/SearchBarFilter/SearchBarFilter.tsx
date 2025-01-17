import { faSearch } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import debounce from 'debounce'
import { useEffect, useMemo, useState } from 'react'
import { TextInput } from '~/components'

type Props = {
  debounceRate?: number
  eventType?: 'podcasts' | 'episodes' | 'clips'
  handleClear?: any
  handleSubmit?: any
  includeBottomPadding?: boolean
  placeholder: string
  rounded?: boolean
  smaller?: boolean
  wrapperClassName?: string
  containerClassName?: string
}

export const SearchBarFilter = ({
  debounceRate = 1000,
  eventType,
  handleClear,
  handleSubmit,
  includeBottomPadding,
  placeholder,
  rounded = false,
  smaller,
  wrapperClassName,
  containerClassName
}: Props) => {
  const [searchText, setSearchText] = useState<string>('')
  const wrapperClass = classNames(
    'search-bar-filter',
    includeBottomPadding ? 'bottom-padding' : '',
    smaller ? 'smaller' : '',
    rounded ? 'rounded' : ''
  )

  /* useEffects */

  useEffect(() => {
    if (eventType) {
      ;(async () => {
        window.addEventListener(`navbar-link-clicked-${eventType}`, _handleClear)
        return () => {
          window.removeEventListener(`navbar-link-clicked-${eventType}`, _handleClear)
        }
      })()
    }
  }, [])

  /* Helper Functions */

  const debouncedHandleSubmit = useMemo(
    () => debounce((val) => handleSubmit(val), debounceRate),
    [debounceRate, handleSubmit]
  )

  const _handleClear = () => {
    handleClear()
    setSearchText('')
  }

  const handleOnChange = (val: string) => {
    setSearchText(val)
    debouncedHandleSubmit(val)
  }

  const handleOnSubmit = () => {
    debouncedHandleSubmit.flush()
  }

  return (
    <div className={classNames(wrapperClass, wrapperClassName)}>
      <TextInput
        faIcon={faSearch}
        handleEndButtonClearButtonClick={searchText && _handleClear}
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
        placeholder={placeholder}
        type='text'
        value={searchText}
      />
    </div>
  )
}

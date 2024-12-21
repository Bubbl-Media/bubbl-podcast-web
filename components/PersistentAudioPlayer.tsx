import { useOmniAural } from 'omniaural'
import { useRef, useEffect } from 'react'
import { setNowPlayingItemOnServer } from '~/services/userNowPlayingItem'

export const PersistentAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playerState] = useOmniAural('player')
  
  useEffect(() => {
    if (audioRef.current) {
      if (playerState.isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [playerState.isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleTimeUpdate = () => {
        if (playerState.currentNowPlayingItem) {
          setNowPlayingItemOnServer(
            playerState.currentNowPlayingItem,
            audio.currentTime
          )
        }
      }

      audio.addEventListener('timeupdate', handleTimeUpdate)
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [playerState.currentNowPlayingItem])

  if (!playerState.currentNowPlayingItem) return null

  return (
    <div className="fixed-audio-player">
      <audio
        ref={audioRef}
        src={playerState.currentNowPlayingItem.episodeMediaUrl}
        style={{ display: 'none' }}
      />
    </div>
  )
} 
import { useState, useEffect } from "react"

export const useAudio = (url: string): [boolean, () => void] => {
  const [playing, setPlaying] = useState(false)

  // audio API can only be called on the client -
  // we need to perform a type check here so we can build the app
  const [audio] = useState<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio(url) : undefined
  )

  const toggle = () => setPlaying(!playing)

  useEffect(() => {
    if (audio) {
      playing ? audio.play() : audio.pause()
    }
  }, [audio, playing])

  useEffect(() => {
    if (audio) {
      audio.addEventListener("ended", () => setPlaying(false))
      return () => {
        audio.removeEventListener("ended", () => setPlaying(false))
      }
    }
  }, [audio])

  return [playing, toggle]
}

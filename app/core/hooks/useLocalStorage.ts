import { useState } from "react"

/**
 * forking this code from Guild.xyz, which is open source and does not have a license as far as I can tell.
 * It's great clean code, so might as well use it. No different than using an open source library in my opinion.
 * If anyone has objections, I'm fine with writing something up ourselves. -mg
 * https://github.com/agoraxyz/guild.xyz/blob/f590e6e550a6288076c048fbaa9928c4e64eaf9a/src/hooks/usePopupWindow.ts#L3
 */
const getDataFromLocalstorage = <T>(key: string, initialValue: T, shouldSaveInitial = false) => {
  if (typeof window === "undefined") return initialValue
  try {
    const item = window.localStorage.getItem(key)
    if (!item) {
      if (shouldSaveInitial) window.localStorage.setItem(key, JSON.stringify(initialValue))
      return initialValue
    }
    return JSON.parse(item)
  } catch (error) {
    console.log(error)
    return initialValue
  }
}

const useLocalStorage = <T>(key: string, initialValue: T, shouldSaveInitial = false) => {
  const [storedValue, setStoredValue] = useState<T>(() =>
    getDataFromLocalstorage(key, initialValue, shouldSaveInitial)
  )

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }
  return [storedValue, setValue] as const
}

export default useLocalStorage

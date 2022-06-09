import { useState, useEffect } from "react"

export const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false)

  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }

  const upHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
  }

  useEffect(() => {
    console.log("hello!")
    window.addEventListener("keydown", downHandler)
    window.addEventListener("keyup", upHandler)

    return () => {
      console.log("goodbye")
      window.removeEventListener("keydown", downHandler)
      window.removeEventListener("keyup", upHandler)
    }
  })

  return keyPressed
}

export default useKeyPress

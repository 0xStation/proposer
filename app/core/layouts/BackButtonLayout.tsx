import { useRouter } from "next/router"
import Image from "next/image"
import BackIcon from "/public/back-icon.svg"

export const BackButtonLayout = ({ children }) => {
  const router = useRouter()
  return (
    <>
      <button
        className="h-[20px] w-[20px] absolute mt-4 ml-4"
        onClick={() => {
          router.back()
        }}
      >
        <Image src={BackIcon} alt="Back icon" />
      </button>
      {children}
    </>
  )
}

export default BackButtonLayout

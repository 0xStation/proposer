import Image from "next/image"
import Globe from "/public/mirror-logo.svg"

const ImageLink = ({ link }) => {
  return (
    <div className="flex flex-row content-center text-marble-white">
      <a href={link}>
        <Image src={Globe} alt="Globe Logo." width={14} height={14} />
      </a>
    </div>
  )
}

export default ImageLink

import { Image } from "blitz"
import Globe from "/public/mirror-logo.svg"

const ImageLink = ({ link }) => {
  return (
    <div className="flex flex-row content-center text-marble-white">
      <a href={link}>
        <Image src={Globe} alt="Globo Logo." width={14} height={14} />
      </a>
    </div>
  )
}

export default ImageLink

import { Image } from "blitz"
import Mirror from "/public/mirror-logo.svg"

const ImageLink = (link) => {
  return (
    <div className="flex flex-row content-center text-marble-white">
      <a href={link.url}>
        <Image src={Mirror} alt="Station's Mirror Page." width={14} height={14} />
      </a>
    </div>
  )
}

export default ImageLink

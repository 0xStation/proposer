import { Image } from "blitz"
import Mirror from "/public/mirror-logo.svg"
import Github from "/public/github_logo.svg"

const ImageLink = ({ link }) => {
  const renderImage = (symbol) => {
    switch (symbol) {
      case 0:
        return <Image src={Mirror} alt="Station's Mirror Page." width={14} height={14} />

      case 1:
        return <Image src={Github} alt="The github logo." width={14} height={14} />
    }
  }

  return (
    <div className="flex flex-row content-center text-marble-white">
      <a href={link.url}>{renderImage(link.symbol)}</a>
    </div>
  )
}

export default ImageLink

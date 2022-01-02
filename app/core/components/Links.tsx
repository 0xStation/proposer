import { Image, Link } from "blitz"
import Mirror from "/public/mirror-logo.svg"

const Links = (link) => {
  return (
    <div className="flex flex-row content-center text-marble-white">
      <Link href={link.url || "https://station.mirror.xyz/"}>
        <Image src={Mirror} alt="Station's Mirror Page." width={14} height={14} />
      </Link>
    </div>
  )
}

export default Links

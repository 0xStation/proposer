import StationLogo from "public/station-letters.svg"
import { Image } from "blitz"

/**
 * TODO: Rename component + folder structure
 */
const TerminalsNavigation = ({ children }: { children?: any }) => {
  return (
    <>
      <div className="h-screen w-[80px] bg-tunnel-black border-r border-concrete fixed text-center">
        <div className="mt-1">
          <Image src={StationLogo} alt="Station logo" height={20} width={65} />
        </div>
        <div className="h-full mt-4">
          <div className="space-y-3">
            {Array.apply(null, Array(3)).map((idx) => (
              <div
                key={idx}
                className="w-[60px] h-[60px] bg-wet-concrete border border-concrete rounded-lg mx-auto"
              />
            ))}
          </div>
          <div className="fixed bottom-[10px] left-[10px]">
            <div
              tabIndex={0}
              className="rounded-full w-[60px] h-[60px] bg-wet-concrete border border-concrete mx-auto cursor-pointer"
            ></div>
          </div>
        </div>
      </div>
      <div className="h-screen left-[80px] relative">{children}</div>
    </>
  )
}

export default TerminalsNavigation

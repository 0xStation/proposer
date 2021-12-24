import { useParam } from "blitz"

const Navigation = ({ children }) => {
  // can use this to eventually fetch the terminal data
  // and replace the placeholders below
  const terminal = useParam("terminal")

  return (
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat border"
      style={{ backgroundImage: "url('/station-cover.png')" }}
    >
      <div className="bg-tunnel-black h-[calc(100vh-15rem)] mt-36">
        <div className="grid grid-cols-4 gap-0 max-w-screen-xl h-full mx-auto">
          <div className="col-span-1 pr-6 text-2xl border-r border-concrete">
            <div className="flex items-center mt-12">
              <span className="border border-marble-white rounded-full h-12 w-12 mr-4 bg-concrete"></span>
              <div className="flex flex-col">
                <h1 className="text-2xl text-marble-white">Station</h1>
                <span className="text-sm text-concrete mt-[-.25rem]">@station</span>
              </div>
            </div>
            <h3 className="text-marble-white text-sm mt-6">
              Building the infrastructure to empower the next billion contributors in web3.
            </h3>
            <ul className="mt-9 text-lg">
              <li className="text-marble-white cursor-pointer">Initiative Board</li>
              <li className="text-concrete hover:text-marble-white cursor-pointer">
                Contributor Directory
              </li>
              <li className="text-concrete hover:text-marble-white cursor-pointer">Waiting Room</li>
            </ul>
          </div>
          <div className="col-span-3 pl-6">
            <div className="mt-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation

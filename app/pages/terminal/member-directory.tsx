import { BlitzPage } from "blitz"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/core/components/TerminalNavigation"

const MemberDirectoryPage: BlitzPage = () => {
  return (
    <Layout>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="h-[130px] border-b border-concrete">
          <h1 className="text-2xl font-bold ml-6 pt-7">Membership Directory</h1>
          <div className="flex ml-6 pt-4 space-x-2">
            <span className="group rounded-full border border-concrete h-[17px] w-max p-4 flex flex-center items-center cursor-pointer hover:bg-marble-white hover:text-tunnel-black">
              Workstreams
              <div className="ml-3">
                <DropdownChevronIcon className="group-hover:fill-tunnel-black" />
              </div>
            </span>
            <span className="group rounded-full border border-concrete h-[17px] w-max p-4 flex flex-center items-center cursor-pointer hover:bg-marble-white hover:text-tunnel-black">
              Role
              <div className="ml-3">
                <DropdownChevronIcon className="group-hover:fill-tunnel-black" />
              </div>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 h-full w-full">
          <div className="overflow-y-auto h-full col-span-4">
            {Array.apply(null, Array(10)).map((idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer"
              >
                <div className="flex space-x-2">
                  <div className="flex flex-colcontent-center align-middle mr-1">
                    <div className="h-[40px] w-[40px] place-self-center border border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                  </div>
                  <div className="flex flex-col content-center">
                    <div className="flex flex-row items-center space-x-1">
                      <div className="text-lg text-marble-white font-bold">contributor name</div>
                    </div>
                    <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                      <div className="w-max truncate leading-4">@address</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-full border-l border-concrete col-span-3">
            <div className="m-5 flex-col">
              <div className="flex space-x-2">
                <div className="flex flex-colcontent-center align-middle mr-1">
                  <div className="h-[40px] w-[40px] place-self-center border border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
                </div>
                <div className="flex flex-col content-center">
                  <div className="flex flex-row items-center space-x-1">
                    <div className="text-lg text-marble-white font-bold">contributor name</div>
                  </div>
                  <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
                    <div className="w-max truncate">@address</div>
                  </div>
                </div>
              </div>
              <div className="mt-9 text-xs">
                <div>
                  <p className="uppercase mb-3">status</p>
                  <span className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold">
                    active
                  </span>
                </div>
                <div className="mt-7">
                  <p className="uppercase mb-3">joined since</p>
                  <p className="text-base">1-Apr-2022</p>
                </div>
                <div className="mt-7">
                  <p className="uppercase mb-3">roles</p>
                  <div className="flex-row space-x-2">
                    <span className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold">
                      contributor
                    </span>
                    <span className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold">
                      founding member
                    </span>
                  </div>
                </div>
                <div className="mt-7">
                  <p className="uppercase mb-3">workstreams</p>
                  <div className="flex-row space-x-2">
                    <span className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold">
                      finance & tokenomics
                    </span>
                    <span className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold">
                      property & interiors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

export default MemberDirectoryPage

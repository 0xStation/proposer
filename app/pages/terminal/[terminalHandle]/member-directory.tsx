import { BlitzPage, useQuery, useParam } from "blitz"
import { Fragment, useEffect, useState } from "react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import { Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { Form } from "react-final-form"
import truncateString from "app/core/utils/truncateString"
import getAccountTerminalsByTerminalId from "app/accountTerminal/queries/getAccountTerminalsByTerminalId"

const MemberDirectoryPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle")
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [filteredAccountTerminals, setFilteredAccountTerminals] = useState<any[]>()
  // selected user for the contributor card
  const [selectedAccountTerminal, setSelectedAccountTerminal] = useState<any>()
  const [filters, setFilters] = useState<Set<string>>(new Set())
  /* 
  `groupedTags` returns in the format where the key
  is the type, and the value is an array of tags:
  {
    initative: [tag1, ...., tagn],
    role: [tag1, ...., tagn],
  }
  */
  const [groupedTags] = useQuery(
    getGroupedTagsByTerminalId,
    { terminalId: terminal?.id as number },
    { suspense: false, enabled: !!terminal?.id }
  )

  const [accountTerminals] = useQuery(
    getAccountTerminalsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      retry: false,
      onSuccess: (accountTerminals) => {
        setFilteredAccountTerminals(accountTerminals)
        setSelectedAccountTerminal(accountTerminals[0])
      },
    }
  )

  useEffect(() => {
    // clear filters on page change
    filters.clear()
  }, [accountTerminals])

  return (
    <Layout>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="h-[130px] border-b border-concrete">
          <h1 className="text-2xl font-bold ml-6 pt-7">Membership Directory</h1>
          <div className="flex ml-6 pt-4 space-x-2">
            {groupedTags && Object.entries(groupedTags).length ? (
              Object.entries(groupedTags).map(([tagType, tags], idx) => (
                <FilterPill
                  tagType={tagType}
                  tags={tags}
                  accountTerminals={accountTerminals}
                  filteredAccountTerminals={filteredAccountTerminals}
                  setFilteredAccountTerminals={setFilteredAccountTerminals}
                  filters={filters}
                  key={`${idx}${tagType}`}
                />
              ))
            ) : (
              <p className="text-marble-white">View other members in the terminal.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-7 h-full w-full">
          <div className="overflow-y-auto h-full col-span-4">
            {filteredAccountTerminals &&
              filteredAccountTerminals.map((accountTerminal, idx) => (
                <ContributorComponent
                  key={`${accountTerminal.joinedAt}${idx}`}
                  accountTerminal={accountTerminal}
                  setSelectedAccountTerminal={setSelectedAccountTerminal}
                />
              ))}
          </div>
          <SelectedContributorCard accountTerminal={selectedAccountTerminal} />
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const PfpImage = ({ account }) =>
  account.data.pfpURL ? (
    <img
      src={account.data.pfpURL}
      alt="PFP"
      className="min-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
    />
  ) : (
    <div className="h-[40px] min-w-[40px] place-self-center border border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
  )

const FilterPill = ({
  tagType,
  tags,
  accountTerminals,
  filteredAccountTerminals,
  setFilteredAccountTerminals,
  filters,
}) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)
  const handleClearFilters = (e) => {
    e.preventDefault()

    // remove the filters for the specific tag type
    tags.forEach((tag) => {
      if (filters.has(tag.value)) {
        filters.delete(tag.value)
      }
    })

    // clear filled checkboxes by removing the defaultChecked value
    setClearDefaultValue(true)
    setFilteredAccountTerminals(accountTerminals)

    if (filters.size === 0) {
      setFilteredAccountTerminals(accountTerminals)
      return
    }

    const newFilteredAccountTerminals = accountTerminals.filter((accountTerminal) =>
      accountTerminal.tags.find((accountTerminalTag) => filters.has(accountTerminalTag.tag.value))
    )

    setFilteredAccountTerminals(newFilteredAccountTerminals)
  }

  return (
    <Menu as="div" className={`relative`}>
      {({ open }) => {
        setClearDefaultValue(false)
        return (
          <>
            <Menu.Button className="block h-[28px] text-marble-white">
              <div className="flex items-center">
                <span className="capitalize group rounded-full border border-concrete h-[17px] w-max p-4 flex flex-center items-center cursor-pointer hover:bg-marble-white hover:text-tunnel-black">
                  {`${tagType}`}
                  <div className="ml-3">
                    <DropdownChevronIcon className="group-hover:fill-tunnel-black" />
                  </div>
                </span>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className={`absolute origin-top-left mt-5 h-auto w-[22rem] bg-tunnel-black border border-concrete rounded-md`}
              >
                <Form
                  onSubmit={(fields) => {
                    Object.entries(fields).forEach(([tagName, value]) => {
                      if (filters.has(tagName) && !value) {
                        filters.delete(tagName)
                      } else if (value) {
                        filters.add(tagName)
                      }
                    })

                    if (filters.size === 0) {
                      setFilteredAccountTerminals(accountTerminals)
                      return
                    }

                    const newFilteredAccountTerminals = accountTerminals.filter((accountTerminal) =>
                      accountTerminal.tags.find((accountTerminalTag) =>
                        filters.has(accountTerminalTag.tag.value)
                      )
                    )

                    setFilteredAccountTerminals(newFilteredAccountTerminals)
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {tags.map((tag) => {
                            return (
                              <div className="flex-row" key={`${clearDefaultValue}${tag.value}`}>
                                <Checkbox
                                  name={`${tag.value}`}
                                  defaultChecked={filters.has(tag.value)}
                                />
                                <p className="inline mx-4">{tag.value}</p>
                              </div>
                            )
                          })}
                        </div>
                        <button
                          type="submit"
                          className="bg-marble-white w-52 text-tunnel-black rounded mb-4 ml-4 mr-1 hover:opacity-70"
                        >
                          Apply
                        </button>
                        <button
                          className="w-[6.5rem] hover:text-concrete"
                          onClick={(e) => handleClearFilters(e)}
                        >
                          Clear all
                        </button>
                      </form>
                    )
                  }}
                ></Form>
              </Menu.Items>
            </Transition>
          </>
        )
      }}
    </Menu>
  )
}

const ContributorComponent = ({ accountTerminal, setSelectedAccountTerminal }) => {
  const { account } = accountTerminal

  return (
    <div
      tabIndex={0}
      className="flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer"
      onClick={() => setSelectedAccountTerminal(accountTerminal)}
    >
      <div className="flex space-x-2">
        <div className="flex flex-colcontent-center align-middle mr-1">
          <PfpImage account={account} />
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-lg text-marble-white font-bold">
              {account.data.name || account.data.discordId}
            </p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            <p className="w-max truncate leading-4">@{truncateString(account.address)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectedContributorCard = ({ accountTerminal }) => {
  if (!accountTerminal) return null
  const { account } = accountTerminal

  const statusTags = accountTerminal.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "status"
  )

  const roleTags = accountTerminal.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "role"
  )
  const initiativeTags = accountTerminal.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "initiative"
  )
  const guildTags = accountTerminal.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "guild"
  )

  return (
    <div className="h-full border-l border-concrete col-span-3">
      <div className="m-5 flex-col">
        <div className="flex space-x-2">
          <div className="flex flex-colcontent-center align-middle mr-1">
            <PfpImage account={account} />
          </div>
          <div className="flex flex-col content-center">
            <div className="flex flex-row items-center space-x-1">
              <div className="text-lg text-marble-white font-bold">
                {account.data.name || account.data.discordId}
              </div>
            </div>
            <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
              <div className="w-max truncate">@{truncateString(account.address)}</div>
            </div>
          </div>
        </div>
        <div className="mt-9 text-xs">
          <TagDetails tagType="status" tags={statusTags} />
          {accountTerminal.joinedAt && (
            <div className="mt-7">
              <p className="uppercase mb-3">joined since</p>
              <p className="text-base">{accountTerminal.joinedAt.toDateString()}</p>
            </div>
          )}
          <TagDetails tagType="roles" tags={roleTags} />
          <TagDetails tagType="initiatives" tags={initiativeTags} />
          <TagDetails tagType="guilds" tags={guildTags} />
        </div>
      </div>
    </div>
  )
}

const TagDetails = ({ tagType, tags }: { tagType: string; tags: any[] }) => {
  if (!tags.length) return null

  return (
    <div className="mt-7">
      <p className="uppercase mb-3">{tagType}</p>
      <div className="flex-row space-x-2">
        {tags.map((accountTerminalTag) => {
          return (
            <span
              key={accountTerminalTag.tag.value}
              className="rounded-full py-1 px-3 bg-wet-concrete uppercase font-bold"
            >
              {accountTerminalTag.tag.value}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default MemberDirectoryPage

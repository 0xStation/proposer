import { BlitzPage, useQuery, useParam, Image, Link, Routes } from "blitz"
import { Fragment, useEffect, useState } from "react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import { Dialog, Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { Form } from "react-final-form"
import truncateString from "app/core/utils/truncateString"
import getMembersByTerminalId from "app/accountTerminal/queries/getMembersByTerminalId"
import { AccountTerminalWithTagsAndAccount } from "app/accountTerminal/types"
import { formatDate } from "app/core/utils/formatDate"
import Exit from "public/exit-button.svg"
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import { toTitleCase } from "app/core/utils/titleCase"
import { RefreshIcon } from "@heroicons/react/outline"
import useStore from "app/core/hooks/useStore"
import { TagType } from "app/tag/types"

interface Filters {
  [tagType: string]: Set<string>
}

const MemberDirectoryPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle")
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  const [filteredMembers, setFilteredMembers] = useState<AccountTerminalWithTagsAndAccount[]>([])
  // selected user to display in the contributor card
  const [selectedMember, setSelectedMember] = useState<AccountTerminalWithTagsAndAccount>()
  const [selectedMemberMobileDrawerIsOpen, setSelectedMemberMobileDrawerIsOpen] =
    useState<boolean>(false)

  const setToastState = useStore((state) => state.setToastState)

  // filters is a hashmap where the key is the tag type and the value is a Set of strings
  // where the strings are applied filters
  const [filters, setFilters] = useState<Filters>({})

  /*
  `groupedTags` returns an object where the key
  is the tag type and the value is an array of tags
  that fall under the category:
  {
    initative: [tag1, ...., tagn],
    role: [tag1, ...., tagn],
  }
  */
  const [groupedTags] = useQuery(
    getGroupedTagsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      onSuccess: (groupedTags) => {
        if (!groupedTags) return
        // create filters object where the tagType (filter category) maps to a set of applied filters
        const filterMap = Object.keys(groupedTags).reduce((filterMap, tagType) => {
          filterMap[tagType] = new Set<string>()
          return filterMap
        }, {})
        setFilters(filterMap)
      },
    }
  )

  useEffect(() => {
    setSelectedMember(filteredMembers[0])
  }, [filteredMembers])

  const [members] = useQuery(
    getMembersByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
      onSuccess: (members: AccountTerminalWithTagsAndAccount[]) => {
        setFilteredMembers(members)
      },
    }
  )

  const refreshRoles = async () => {
    if (terminal) {
      const response = await fetch("/api/discord/sync-roles", {
        method: "POST",
        body: JSON.stringify({
          terminalId: terminal.id,
        }),
      })

      if (response.status !== 200) {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Something went wrong!",
        })
        return
      }

      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your roles are refreshed",
      })
    }
  }

  // TODO add automatic toast stacking for multiple simultaneous toast displays
  const refreshTokens = async () => {
    // only trigger refresh if terminal has tokens
    if (terminal && terminal.tags.filter((t) => t.type === TagType.TOKEN).length > 0) {
      const response = await fetch("/api/sync-tokens", {
        method: "POST",
        body: JSON.stringify({
          terminalId: terminal.id,
        }),
      })

      // timeout to not make toasts overlap with sync-roles
      // TODO replace this with toast enabling stacking instead
      // https://linear.app/station/issue/WEB-424/if-queuing-multiple-toasts-simultaneously-stack-them
      await setTimeout(() => {
        if (response.status !== 200) {
          setToastState({
            isToastShowing: true,
            type: "error",
            message: "Something went wrong!",
          })
          return
        }

        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Your tokens are refreshed",
        })
      }, 2000)
    }
  }

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Members`}>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="max-h-[250px] sm:h-[130px] border-b border-concrete">
          <div className="flex flex-row items-center ml-6 pt-7">
            <h1 className="text-2xl font-bold">Members</h1>
            {groupedTags && Object.entries(groupedTags).length ? (
              <RefreshIcon
                className="h-5 w-5 ml-2 mt-1 cursor-pointer"
                aria-hidden="true"
                onClick={() => {
                  refreshRoles()
                  refreshTokens()
                }}
              />
            ) : null}
          </div>
          <div className="flex ml-6 py-4 space-x-2 flex-wrap">
            {groupedTags && Object.entries(groupedTags).length ? (
              Object.entries(groupedTags).map(([tagType, tags], idx) => (
                <FilterPill
                  tagType={tagType}
                  tags={tags}
                  allMembers={members}
                  setFilteredMembers={setFilteredMembers}
                  filters={filters}
                  key={`${idx}${tagType}`}
                />
              ))
            ) : (
              <p className="text-marble-white">View other members in the terminal.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-7 h-[calc(100vh-130px)] w-full box-border">
          <div className="overflow-y-auto col-span-7 sm:col-span-4">
            {filteredMembers &&
              filteredMembers.map((member, idx) => (
                <ContributorComponent
                  key={`${member.joinedAt}${idx}`}
                  member={member}
                  selectedMember={selectedMember}
                  setSelectedMember={setSelectedMember}
                  setSelectedMemberMobileDrawerIsOpen={setSelectedMemberMobileDrawerIsOpen}
                />
              ))}
          </div>
          <SelectedContributorCard
            member={selectedMember}
            selectedMemberMobileDrawerIsOpen={selectedMemberMobileDrawerIsOpen}
            setSelectedMemberMobileDrawerIsOpen={setSelectedMemberMobileDrawerIsOpen}
          />
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const FilterPill = ({ tagType, tags, allMembers, setFilteredMembers, filters }) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  // apply filters on accounts
  const applyFilters = () => {
    let clearFilters = true
    // reset directory to show all contributors if no filters are selected
    Object.entries(filters).map(([tagType, tagFilter]: [string, Set<string>]) => {
      if (tagFilter.size > 0) {
        clearFilters = false
      }
    })
    if (clearFilters) {
      setFilteredMembers(allMembers)
      return
    }

    const newFilteredMembers = allMembers.filter((member) => {
      let meetsFilterRequirements = [] as (boolean | undefined)[]

      Object.entries(filters).map(([tagType, tagFilter]: [string, Set<string>]) => {
        // member meets the category's filter if:
        // member has any of the tags in the category's applied filters
        // or there are no applied filters.
        const satisfiesFilter =
          !tagFilter.size ||
          member.tags.find((accountTerminalTag) => tagFilter.has(accountTerminalTag.tag.value))

        meetsFilterRequirements.push(!!satisfiesFilter)
      })
      // if user satisfies all category's filter requirements, show them in the member directory
      if (meetsFilterRequirements.every((val) => val)) {
        return member
      }
    })
    setFilteredMembers(newFilteredMembers)
  }

  const handleClearFilters = (e) => {
    e.preventDefault()

    filters[tagType].clear()

    // clear filled checkboxes by removing the defaultChecked value
    // bumping the key will reset the uncontrolled component's internal state
    setClearDefaultValue(true)
    applyFilters()
  }

  return (
    <Menu as="div" className="relative mb-2 sm:mb-0">
      {({ open }) => {
        setClearDefaultValue(false)
        return (
          <>
            <Menu.Button className="block h-[28px] text-marble-white">
              <div className="flex items-center">
                <span
                  className={`${
                    open
                      ? "bg-marble-white text-tunnel-black  border-marble-white"
                      : "hover:bg-marble-white hover:text-tunnel-black border-concrete hover:border-marble-white"
                  } capitalize group rounded-full border h-[17px] w-max p-4 flex flex-center items-center cursor-pointer `}
                >
                  {tagType}{" "}
                  {filters[tagType] && filters[tagType].size ? `(${filters[tagType].size})` : ""}
                  <div className="ml-3">
                    <DropdownChevronIcon
                      className={`${open ? "fill-tunnel-black" : "group-hover:fill-tunnel-black"}`}
                    />
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
              <Menu.Items className="absolute origin-top-left mt-5 h-auto w-[11rem] sm:w-[22rem] bg-tunnel-black border border-concrete rounded-md z-10">
                <Form
                  onSubmit={(field) => {
                    if (!field || !Object.keys(field).length || !Object.entries(field)[0]) {
                      return
                    }
                    // grab field selected
                    const [tagType, tagNames] = Object.entries(field)[0] as [string, any]
                    const tagFilters = filters[tagType]
                    Object.entries(tagNames).forEach(([tagName, value]) => {
                      // remove tag if de-selected
                      if (tagFilters.has(tagName) && !value) {
                        tagFilters.delete(tagName)
                      } else if (value) {
                        // add tag if selected
                        tagFilters.add(tagName)
                      }
                    })

                    applyFilters()
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {tags.map((tag) => {
                            return (
                              <div className="flex-row" key={`${clearDefaultValue}${tag.value}`}>
                                <Checkbox
                                  name={`${tag.type}.${tag.value}`}
                                  defaultChecked={filters[tag.type].has(tag.value)}
                                  className="align-middle"
                                />
                                <p className="p-0.5 align-middle mx-4 inline leading-none">
                                  {
                                    // title case text except on ERC20 tokens
                                    tag.value[0] === "$" ? tag.value : toTitleCase(tag.value)
                                  }
                                </p>
                              </div>
                            )
                          })}
                        </div>
                        <button
                          type="submit"
                          className="bg-marble-white w-36 sm:w-52 h-[35px] text-tunnel-black rounded mb-4 ml-4 mr-1 hover:opacity-70"
                        >
                          Apply
                        </button>
                        <button
                          className="w-[6.5rem] hover:text-concrete mb-2 sm:mb-0"
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

const ContributorComponent = ({
  member,
  selectedMember,
  setSelectedMember,
  setSelectedMemberMobileDrawerIsOpen,
}) => {
  const { account } = member

  return (
    <div
      tabIndex={0}
      className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
        account.id === selectedMember?.account?.id ? "bg-wet-concrete" : ""
      }`}
      onClick={() => {
        setSelectedMember(member)
        setSelectedMemberMobileDrawerIsOpen(true)
      }}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          {account.data.pfpURL ? (
            <img
              src={account.data.pfpURL}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
            />
          ) : (
            <div className="h-[46px] min-w-[46px] place-self-center border border-wet-concrete bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
          )}
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <p className="text-lg text-marble-white font-bold">
              {account.data.name || account.data.discordId}
            </p>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            {account.address && (
              <p className="w-max truncate leading-4">@{truncateString(account.address)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectedContributorCard = ({
  member,
  selectedMemberMobileDrawerIsOpen,
  setSelectedMemberMobileDrawerIsOpen,
}) => {
  if (!member) return null
  const { account } = member

  const statusTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.STATUS
  )
  const roleTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.ROLE
  )
  const projectTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.PROJECT
  )
  const guildTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.GUILD
  )
  const tokenTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.TOKEN
  )

  const profileLink = account.address
    ? Routes.ProfileHome({ accountAddress: account.address })
    : Routes.DiscordProfileHome({ discordId: account.discordId })

  const selectedContributorCardContent = (
    <div className="m-5 flex-col">
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          <Link href={profileLink}>
            {account.data.pfpURL ? (
              <img
                src={account.data.pfpURL}
                alt="PFP"
                className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete hover:border-marble-white"
              />
            ) : (
              <div className="h-[46px] w-[46px] place-self-center border border-wet-concrete hover:border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
            )}
          </Link>
        </div>
        <div className="flex flex-col content-center">
          <div className="flex flex-row items-center space-x-1">
            <div className="text-lg text-marble-white font-bold">
              {account.data.name || account.data.discordId}
            </div>
          </div>
          <div className="flex flex-row text-sm text-concrete space-x-1 overflow-hidden">
            {account.address ? (
              <div className="w-max truncate leading-4">@{truncateString(account.address)}</div>
            ) : (
              <div className="w-max truncate leading-4">Imported from discord</div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 space-x-4">
        {account?.data?.contactURL && (
          <a
            href={account?.data?.contactURL}
            target="_blank"
            className="hover:opacity-70 cursor-pointer"
            rel="noreferrer"
          >
            <Image src={PersonalSiteIcon} alt="Personal Site Icon." width={15} height={15} />
          </a>
        )}
        {account?.data?.twitterUrl && (
          <a
            href={account?.data?.twitterUrl}
            target="_blank"
            className="hover:opacity-70 cursor-pointer"
            rel="noreferrer"
          >
            <Image src={TwitterIcon} alt="Twitter Icon." width={15} height={15} />
          </a>
        )}
        {account?.data?.githubUrl && (
          <a
            href={account?.data?.githubUrl}
            target="_blank"
            className="hover:opacity-70 cursor-pointer"
            rel="noreferrer"
          >
            <Image src={GithubIcon} alt="Github Icon." width={15} height={15} />
          </a>
        )}
        {account?.data?.tiktokUrl && (
          <a
            href={account?.data?.tiktokUrl}
            target="_blank"
            className="hover:opacity-70 cursor-pointer"
            rel="noreferrer"
          >
            <Image src={TikTokIcon} alt="TikTok Icon." width={15} height={15} />
          </a>
        )}
        {account?.data?.instagramUrl && (
          <a
            href={account?.data?.instagramUrl}
            target="_blank"
            className="hover:opacity-70 cursor-pointer"
            rel="noreferrer"
          >
            <Image src={InstagramIcon} alt="Instagram Icon." width={15} height={15} />
          </a>
        )}
      </div>
      {account?.data?.bio && (
        <>
          <p className="mt-4">{account?.data?.bio}</p>
          <hr className="text-concrete mt-6" />
        </>
      )}
      <div className="mt-5 text-xs">
        <TagDetails tagType="status" tags={statusTags} />
        {member.joinedAt && (
          <div className="mt-7">
            <p className="uppercase mb-2">joined since</p>
            <p className="text-base">{formatDate(member.joinedAt)}</p>
          </div>
        )}
        <TagDetails tagType="roles" tags={roleTags} />
        <TagDetails tagType="projects" tags={projectTags} />
        <TagDetails tagType="guilds" tags={guildTags} />
        <TagDetails tagType="tokens" tags={tokenTags} />
      </div>
    </div>
  )

  return (
    <>
      <div className="h-full border-l border-concrete hidden sm:col-span-3 sm:block">
        {selectedContributorCardContent}
      </div>
      <Transition.Root show={selectedMemberMobileDrawerIsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden block sm:hidden"
          onClose={setSelectedMemberMobileDrawerIsOpen}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-tunnel-black bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="pointer-events-auto w-screen max-w-xs">
                  <div className="flex h-full flex-col overflow-y-scroll bg-tunnel-black border-l border-concrete">
                    <div className="px-4">
                      <>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex justify-between h-7 items-center w-full">
                            <button
                              className="mt-4 mr-4 text-right"
                              onClick={() => setSelectedMemberMobileDrawerIsOpen(false)}
                            >
                              <Image src={Exit} alt="Close button" width={12} height={12} />
                            </button>
                          </div>
                          <Dialog.Title className="text-lg font-medium text-marble-white"></Dialog.Title>
                        </div>
                      </>
                    </div>
                    {selectedContributorCardContent}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

const TagDetails = ({ tagType, tags }: { tagType: string; tags: any[] }) => {
  if (!tags.length) return null

  return (
    <div className="mt-7">
      <p className="uppercase mb-2">
        {tags.length > 1 || tagType === "status" ? tagType : tagType.slice(0, -1)}
      </p>
      <div className="flex-row space-y-2 align-left mr-2">
        {tags.map((accountTerminalTag) => {
          return (
            <span
              key={accountTerminalTag.tag.value}
              className="rounded-full py-1 px-3 mr-2 bg-wet-concrete uppercase font-bold inline-block"
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

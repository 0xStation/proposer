import { BlitzPage, useQuery, useParam, Image, Link, Routes } from "blitz"
import { Fragment, useEffect, useState } from "react"
import DropdownChevronIcon from "app/core/icons/DropdownChevronIcon"
import BackArrow from "app/core/icons/BackArrow"
import ForwardArrow from "app/core/icons/ForwardArrow"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import { Menu, Transition } from "@headlessui/react"
import Checkbox from "app/core/components/form/Checkbox"
import { Form } from "react-final-form"
import truncateString from "app/core/utils/truncateString"
import getMembersByTerminalId from "app/accountTerminal/queries/getMembersByTerminalId"
import getMemberCountByTerminalId from "app/accountTerminal/queries/getMemberCountByTerminalId"
import { AccountTerminalWithTagsAndAccount } from "app/accountTerminal/types"
import { formatDate } from "app/core/utils/formatDate"
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
  [tagType: string]: Set<number>
}

const MemberDirectoryPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle")
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  // selected user to display in the contributor card
  const [selectedMember, setSelectedMember] = useState<AccountTerminalWithTagsAndAccount>()
  const [page, setPage] = useState<number>(0)
  const setToastState = useStore((state) => state.setToastState)

  // filters is a hashmap where the key is the tag type and the value is a Set of strings
  // where the strings are applied filters
  const [filters, setFilters] = useState<Filters>({})
  console.log(filters)

  const paginationTake = 100

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

  const [members] = useQuery(
    getMembersByTerminalId,
    {
      terminalId: terminal?.id as number,
      tagGroups: Object.values(filters)
        .map((set) => Array.from(set))
        .filter((arr) => arr.length > 0),
      page: page,
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  const [memberCount] = useQuery(
    getMemberCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      tagGroups: Object.values(filters)
        .map((set) => Array.from(set))
        .filter((arr) => arr.length > 0),
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (members) {
      setSelectedMember(members[0])
    }
  }, [members])

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
        <div className="h-[130px] border-b border-concrete">
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
          <div className="flex flex-row justify-between items-center">
            <div className="flex ml-6 pt-4 space-x-2">
              {groupedTags && Object.entries(groupedTags).length ? (
                Object.entries(groupedTags).map(([tagType, tags], idx) => (
                  <FilterPill
                    tagType={tagType}
                    tags={tags}
                    filters={filters}
                    setFilters={setFilters}
                    setPage={setPage}
                    key={`${idx}${tagType}`}
                  />
                ))
              ) : (
                <p className="text-marble-white">View other members in the terminal.</p>
              )}
            </div>
            <div className="mr-6 flex flex-row space-x-2 pt-4 items-center text-sm">
              <div className="mr-6">
                Showing
                <span className="text-electric-violet font-bold">
                  {" "}
                  {page * paginationTake + 1}{" "}
                </span>
                to
                <span className="text-electric-violet font-bold">
                  {" "}
                  {(page + 1) * paginationTake > memberCount!
                    ? memberCount
                    : (page + 1) * paginationTake}{" "}
                </span>
                of
                <span className="font-bold"> {memberCount} </span>
                members
              </div>
              <button className="w-6" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <BackArrow className={`${page === 0 ? "fill-concrete" : "fill-marble-white"}`} />
              </button>
              <button
                disabled={members?.length! < paginationTake}
                onClick={() => setPage(page + 1)}
              >
                <ForwardArrow
                  className={`${
                    members?.length! < paginationTake ? "fill-concrete" : "fill-marble-white"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 h-[calc(100vh-130px)] w-full box-border">
          <div className="overflow-y-auto col-span-4">
            <div className="overflow-y-auto">
              {members &&
                members.map((member, idx) => (
                  <ContributorComponent
                    key={`${member.joinedAt}${idx}`}
                    member={member}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                  />
                ))}
            </div>
          </div>
          <SelectedContributorCard member={selectedMember} />
        </div>
      </TerminalNavigation>
    </Layout>
  )
}

const FilterPill = ({ tagType, tags, filters, setFilters, setPage }) => {
  const [clearDefaultValue, setClearDefaultValue] = useState<boolean>(false)

  const handleClearFilters = (e) => {
    e.preventDefault()

    const tagFilters = filters[tagType]
    tagFilters.clear()

    setPage(0)
    setFilters({
      ...filters,
      [tagType]: tagFilters,
    })

    // clear filled checkboxes by removing the defaultChecked value
    // bumping the key will reset the uncontrolled component's internal state
    setClearDefaultValue(true)
  }

  return (
    <Menu as="div" className={`relative`}>
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
              <Menu.Items
                className={`absolute origin-top-left mt-5 h-auto w-[22rem] bg-tunnel-black border border-concrete rounded-md`}
              >
                <Form
                  onSubmit={(field) => {
                    if (!field || !Object.keys(field).length || !Object.entries(field)[0]) {
                      return
                    }
                    // grab field selected
                    const [tagType, tagNames] = Object.entries(field)[0] as [
                      string,
                      Record<string, number[]>
                    ]
                    const tagFilters = filters[tagType]
                    Object.entries(tagNames).forEach(([tagName, value]) => {
                      // remove tag if de-selected
                      if (tagFilters.has(tagName) && !value) {
                        tagFilters.delete(tagName)
                      } else if (value) {
                        // add tag if selected
                        tagFilters.add(value[0])
                      }
                    })

                    setPage(0)
                    setFilters({
                      ...filters,
                      [tagType]: tagFilters,
                    })
                  }}
                  render={({ form, handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="mt-[1.4rem] mx-[1.15rem] mb-5 space-y-3">
                          {tags.map((tag) => {
                            return (
                              <div className="flex-row" key={`${clearDefaultValue}${tag.value}`}>
                                <Checkbox
                                  value={tag.id}
                                  name={`${tag.type}.${tag.value}`}
                                  defaultChecked={filters[tag.type].has(tag.id)}
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
                          className="bg-marble-white w-52 h-[35px] text-tunnel-black rounded mb-4 ml-4 mr-1 hover:opacity-70"
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

const ContributorComponent = ({ member, selectedMember, setSelectedMember }) => {
  const { account } = member

  return (
    <div
      tabIndex={0}
      className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer ${
        account.id === selectedMember?.account?.id ? "bg-wet-concrete" : ""
      }`}
      onClick={() => setSelectedMember(member)}
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

const SelectedContributorCard = ({ member }) => {
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

  return (
    <div className="h-full border-l border-concrete col-span-3">
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
    </div>
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

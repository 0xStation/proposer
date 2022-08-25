import { BlitzPage, useQuery, useParam, Image, Link, Routes, invalidateQuery } from "blitz"
import { Fragment, useEffect, useState } from "react"
import { DEFAULT_PFP_URLS, PAGINATION_TAKE } from "app/core/utils/constants"
import Layout from "app/core/layouts/Layout"
import TerminalNavigation from "app/terminal/components/TerminalNavigation"
import getTerminalByHandle from "app/terminal/queries/getTerminalByHandle"
import getGroupedTagsByTerminalId from "app/tag/queries/getGroupedTagsByTerminalId"
import { Dialog, Transition } from "@headlessui/react"
import truncateString from "app/core/utils/truncateString"
import getMembersByTerminalId from "app/accountTerminal/queries/getMembersByTerminalId"
import getMemberCountByTerminalId from "app/accountTerminal/queries/getMemberCountByTerminalId"
import { AccountTerminalWithTagsAndAccount } from "app/accountTerminal/types"
import { formatDate } from "app/core/utils/formatDate"
import Exit from "public/exit-button.svg"
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"
import { toTitleCase } from "app/core/utils/titleCase"
import {
  RefreshIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline"
import useStore from "app/core/hooks/useStore"
import { TagType } from "app/tag/types"
import useKeyPress from "app/core/hooks/useKeyPress"
import FilterPill from "app/core/components/FilterPill"
import Pagination from "app/core/components/Pagination"

const MemberDirectoryPage: BlitzPage = () => {
  const terminalHandle = useParam("terminalHandle")
  const [terminal] = useQuery(
    getTerminalByHandle,
    { handle: terminalHandle as string },
    { suspense: false, enabled: !!terminalHandle }
  )
  // selected user to display in the contributor card
  const [selectedMember, setSelectedMember] = useState<AccountTerminalWithTagsAndAccount>()
  const [selectedMemberMobileDrawerIsOpen, setSelectedMemberMobileDrawerIsOpen] =
    useState<boolean>(false)

  const [page, setPage] = useState<number>(0)
  const setToastState = useStore((state) => state.setToastState)
  const [isContributorsLoading, setIsContributorsLoading] = useState<boolean>(false)

  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set<string>())
  const [roleFilters, setRoleFilters] = useState<Set<string>>(new Set<string>())
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set<string>())
  const [guildFilters, setGuildFilters] = useState<Set<string>>(new Set<string>())
  const [tokenFilters, setTokenFilters] = useState<Set<string>>(new Set<string>())

  /*
  `groupedTags` returns an object where the key
  is the tag type and the value is an array of tags
  that fall under the category:
  {
    initative: [tag1, ...., tagn],
    role: [tag1, ...., tagn],
  }
  */
  const [groupedTags, { refetch: refetchGroupedTags }] = useQuery(
    getGroupedTagsByTerminalId,
    { terminalId: terminal?.id as number },
    {
      suspense: false,
      enabled: !!terminal?.id,
    }
  )

  const [members, { refetch: refetchMembers }] = useQuery(
    getMembersByTerminalId,
    {
      terminalId: terminal?.id as number,
      tagGroups: [statusFilters, roleFilters, projectFilters, guildFilters, tokenFilters]
        .map((set) => Array.from(set).map((val) => parseInt(val)))
        .filter((arr) => arr.length > 0),
      page: page,
      paginationTake: PAGINATION_TAKE,
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  const [memberCount, { refetch: refetchMemberCount }] = useQuery(
    getMemberCountByTerminalId,
    {
      terminalId: terminal?.id as number,
      tagGroups: [statusFilters, roleFilters, projectFilters, guildFilters, tokenFilters]
        .map((set) => Array.from(set).map((val) => parseInt(val)))
        .filter((arr) => arr.length > 0),
    },
    {
      suspense: false,
      enabled: !!terminal?.id,
      refetchOnWindowFocus: false,
    }
  )

  const downPress = useKeyPress("ArrowDown")
  const upPress = useKeyPress("ArrowUp")
  const enterPress = useKeyPress("Enter")
  const [cursor, setCursor] = useState(0)
  const [hovered, setHovered] = useState(undefined)

  useEffect(() => {
    if (members?.length && downPress) {
      setCursor((prevState) => (prevState < members?.length - 1 ? prevState + 1 : prevState))
      setSelectedMember(members[cursor])
    }
  }, [downPress])

  useEffect(() => {
    if (members?.length && upPress) {
      setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState))
      setSelectedMember(members[cursor])
    }
  }, [upPress])

  useEffect(() => {
    if (members?.length && enterPress) {
      setSelectedMember(members[cursor])
    }
  }, [cursor, enterPress])

  useEffect(() => {
    if (members?.length && hovered) {
      setCursor(members?.indexOf(hovered))
    }
  }, [hovered])

  useEffect(() => {
    setPage(0)
  }, [terminalHandle])

  useEffect(() => {
    if (members) {
      setSelectedMember(members[0])
    }
  }, [members])

  const refreshRoles = async () => {
    if (terminal) {
      setIsContributorsLoading(true)
      const response = await fetch("/api/discord/sync-roles", {
        method: "POST",
        body: JSON.stringify({
          terminalId: terminal.id,
        }),
      })

      if (response.status !== 200) {
        setIsContributorsLoading(false)
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Something went wrong!",
        })
        return
      }
      refetchGroupedTags()
      refetchMembers()
      refetchMemberCount()

      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Your roles are refreshed",
      })
      setIsContributorsLoading(false)
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

  const filtersRefetchCallback = () => {
    invalidateQuery(getMembersByTerminalId)
    invalidateQuery(getMemberCountByTerminalId)
    setPage(0)
  }

  return (
    <Layout title={`${terminal?.data?.name ? terminal?.data?.name + " | " : ""}Members`}>
      <TerminalNavigation>
        {/* Filter View */}
        <div className="max-h-[250px] sm:h-[130px] border-b border-concrete">
          <div className="flex flex-row items-center ml-6 pt-7">
            <h1 className="text-2xl font-bold">Members</h1>
            {groupedTags && Object.entries(groupedTags).length ? (
              <button
                onClick={() => {
                  refreshRoles()
                  refreshTokens()
                }}
                disabled={isContributorsLoading}
              >
                <RefreshIcon
                  className={`h-5 w-5 ml-2 mt-1 hover:stroke-concrete ${
                    isContributorsLoading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex ml-6 py-4 space-x-2 flex-wrap self-start">
              {groupedTags && Object.entries(groupedTags).length ? (
                <>
                  {groupedTags && groupedTags[TagType.STATUS] && (
                    <FilterPill
                      label={TagType.STATUS}
                      filterOptions={groupedTags[TagType.STATUS].map((tag) => {
                        return { name: toTitleCase(tag.value), value: tag?.id?.toString() }
                      })}
                      appliedFilters={statusFilters}
                      setAppliedFilters={setStatusFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                  {groupedTags && groupedTags[TagType.ROLE] && (
                    <FilterPill
                      label={TagType.ROLE}
                      filterOptions={groupedTags[TagType.ROLE].map((tag) => {
                        return { name: toTitleCase(tag.value), value: tag?.id?.toString() }
                      })}
                      appliedFilters={roleFilters}
                      setAppliedFilters={setRoleFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                  {groupedTags && groupedTags[TagType.PROJECT] && (
                    <FilterPill
                      label={TagType.PROJECT}
                      filterOptions={groupedTags[TagType.PROJECT].map((tag) => {
                        return { name: toTitleCase(tag.value), value: tag?.id?.toString() }
                      })}
                      appliedFilters={projectFilters}
                      setAppliedFilters={setProjectFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                  {groupedTags && groupedTags[TagType.GUILD] && (
                    <FilterPill
                      label={TagType.GUILD}
                      filterOptions={groupedTags[TagType.GUILD].map((tag) => {
                        return {
                          name: toTitleCase(tag.value),
                          value: tag?.id?.toString() as string,
                        }
                      })}
                      appliedFilters={guildFilters}
                      setAppliedFilters={setGuildFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                  {groupedTags && groupedTags[TagType.TOKEN] && (
                    <FilterPill
                      label={TagType.TOKEN}
                      filterOptions={groupedTags[TagType.TOKEN].map((tag) => {
                        return { name: tag.value, value: tag?.id?.toString() }
                      })}
                      appliedFilters={tokenFilters}
                      setAppliedFilters={setTokenFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                  {groupedTags && groupedTags[TagType.SEASON] && (
                    <FilterPill
                      label={TagType.SEASON}
                      filterOptions={groupedTags[TagType.SEASON].map((tag) => {
                        return { name: tag.value, value: tag?.id?.toString() }
                      })}
                      appliedFilters={tokenFilters}
                      setAppliedFilters={setTokenFilters}
                      refetchCallback={filtersRefetchCallback}
                    />
                  )}
                </>
              ) : (
                <p className="text-marble-white">View other members in the terminal.</p>
              )}
            </div>
            <Pagination
              page={page}
              setPage={setPage}
              results={members as any[]}
              resultsCount={memberCount as number}
              resultsLabel="members"
              className="ml-6 sm:mr-6 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-7 h-[calc(100vh-130px)] w-full box-border">
          <div className="overflow-y-auto col-span-7 sm:col-span-4">
            {members && !isContributorsLoading
              ? members.map((member, idx) => (
                  <ContributorComponent
                    key={`${member.joinedAt}${idx}`}
                    member={member}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    setSelectedMemberMobileDrawerIsOpen={setSelectedMemberMobileDrawerIsOpen}
                    setHovered={setHovered}
                  />
                ))
              : Array.from(Array(15)).map((idx) => (
                  <div
                    key={idx}
                    tabIndex={0}
                    className={`flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg bg-wet-concrete shadow border-solid h-[70px] motion-safe:animate-pulse`}
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

const ContributorComponent = ({
  member,
  selectedMember,
  setSelectedMember,
  setSelectedMemberMobileDrawerIsOpen,
  setHovered,
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
      onMouseEnter={() => setHovered(member)}
      onMouseLeave={() => setHovered(undefined)}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          {account.data.pfpURL ? (
            <img
              src={account.data.pfpURL}
              alt="PFP"
              className="min-w-[46px] max-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PFP_URLS.USER
              }}
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
  const [isClipboardAddressCopied, setIsClipboardAddressCopied] = useState<boolean>(false)
  if (!member) return null
  const { account } = member

  const statusTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.STATUS
  )
  const seasonTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === TagType.SEASON
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
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PFP_URLS.USER
                }}
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
              <>
                <span className="w-max truncate leading-4 text-concrete">
                  @{truncateString(account.address)}
                </span>
                <a
                  href={`https://etherscan.io/address/${account.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLinkIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                </a>
                <div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(account.address).then(() => {
                        setIsClipboardAddressCopied(true)
                        setTimeout(() => setIsClipboardAddressCopied(false), 3000)
                      })
                    }}
                  >
                    {isClipboardAddressCopied ? (
                      <>
                        <ClipboardCheckIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                      </>
                    ) : (
                      <ClipboardIcon className="h-4 w-4 hover:stroke-concrete cursor-pointer" />
                    )}
                  </button>
                  {isClipboardAddressCopied && (
                    <span className="text-[.5rem] uppercase font-bold tracking-wider rounded px-1 absolute text-marble-white bg-wet-concrete">
                      copied!
                    </span>
                  )}
                </div>
              </>
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
      <div className="mt-7 text-xs">
        <TagDetails tagType="status" tags={statusTags} />
        {member.joinedAt && (
          <div className="mt-5">
            <p className="uppercase mb-2">joined since</p>
            <p className="text-base">{formatDate(member.joinedAt)}</p>
          </div>
        )}
        <TagDetails tagType="seasons" tags={seasonTags} />
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
    <div className="mt-5">
      <p className="uppercase mb-3">
        {tags.length > 1 || tagType === "status" ? tagType : tagType.slice(0, -1)}
      </p>
      <div className="flex-row mt-2 align-left mr-2">
        {tags.map((accountTerminalTag) => {
          return (
            <span
              key={accountTerminalTag.tag.value}
              className="rounded-full py-1 px-3 mr-2 mb-2 bg-wet-concrete uppercase font-bold inline-block"
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

import { BlitzPage, useQuery, useParam, Image, Link, Routes } from "blitz"
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
import getMembersByTerminalId from "app/accountTerminal/queries/getMembersByTerminalId"
import { AccountTerminalWithTagsAndAccount } from "app/accountTerminal/types"
import { formatDate } from "app/core/utils/formatDate"
import GithubIcon from "public/github-icon.svg"
import TwitterIcon from "public/twitter-icon.svg"
import PersonalSiteIcon from "public/personal-site-icon.svg"
import InstagramIcon from "public/instagram-icon.svg"
import TikTokIcon from "public/tiktok-icon.svg"

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

  // filters is a hashmap where the key is the tag type and the value is a Set of strings
  // where the strings are applied filters
  const [filters, setFilters] = useState<Filters>({})

  useEffect(() => {
    const _ = async () => {
      let l = await fetch("/api/discord/demo")
      let j = await l.json()
      console.log(j)
    }
    _()
  }, [])

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
          <div className="overflow-y-auto col-span-4">
            {filteredMembers &&
              filteredMembers.map((member, idx) => (
                <ContributorComponent
                  key={`${member.joinedAt}${idx}`}
                  member={member}
                  setSelectedMember={setSelectedMember}
                />
              ))}
          </div>
          <SelectedContributorCard member={selectedMember} />
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
                                  {tag.value}
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

const ContributorComponent = ({ member, setSelectedMember }) => {
  const { account } = member

  return (
    <div
      tabIndex={0}
      className="flex flex-row space-x-52 p-3 mx-3 mt-3 rounded-lg hover:bg-wet-concrete cursor-pointer"
      onClick={() => setSelectedMember(member)}
    >
      <div className="flex space-x-2">
        <div className="flex flex-col content-center align-middle mr-1">
          {account.data.pfpURL ? (
            <img
              src={account.data.pfpURL}
              alt="PFP"
              className="min-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete"
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
    (accountTerminalTag) => accountTerminalTag.tag.type === "status"
  )

  const roleTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "role"
  )
  const initiativeTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "initiative"
  )
  const guildTags = member.tags?.filter(
    (accountTerminalTag) => accountTerminalTag.tag.type === "guild"
  )

  return (
    <div className="h-full border-l border-concrete col-span-3">
      <div className="m-5 flex-col">
        <div className="flex space-x-2">
          <div className="flex flex-col content-center align-middle mr-1">
            <Link href={Routes.ProfileHome({ accountAddress: account.address })}>
              {account.data.pfpURL ? (
                <img
                  src={account.data.pfpURL}
                  alt="PFP"
                  className="min-w-[46px] h-[46px] rounded-full cursor-pointer border border-wet-concrete hover:border-marble-white"
                />
              ) : (
                <div className="h-[46px] min-w-[46px] place-self-center border border-wet-concrete hover:border-marble-white bg-gradient-to-b object-cover from-electric-violet to-magic-mint rounded-full place-items-center" />
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
                <div className="w-max truncate leading-4">Imported from Discord</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 space-x-4">
          {account?.data?.contactURL && (
            <a href={account?.data?.contactURL} className="hover:opacity-70 cursor-pointer">
              <Image src={PersonalSiteIcon} alt="Personal Site Icon." width={15} height={15} />
            </a>
          )}
          {account?.data?.twitterUrl && (
            <a href={account?.data?.twitterUrl} className="hover:opacity-70 cursor-pointer">
              <Image src={TwitterIcon} alt="Twitter Icon." width={15} height={15} />
            </a>
          )}
          {account?.data?.githubUrl && (
            <a href={account?.data?.githubUrl} className="hover:opacity-70 cursor-pointer">
              <Image src={GithubIcon} alt="Github Icon." width={15} height={15} />
            </a>
          )}
          {account?.data?.tiktokUrl && (
            <a href={account?.data?.tiktokUrl} className="hover:opacity-70 cursor-pointer">
              <Image src={TikTokIcon} alt="TikTok Icon." width={15} height={15} />
            </a>
          )}
          {account?.data?.instagramUrl && (
            <a href={account?.data?.instagramUrl} className="hover:opacity-70 cursor-pointer">
              <Image src={InstagramIcon} alt="Instagram Icon." width={15} height={15} />
            </a>
          )}
        </div>
        <div className="mt-5 text-xs">
          <TagDetails tagType="status" tags={statusTags} />
          {member.joinedAt && (
            <div className="mt-7">
              <p className="uppercase mb-3">joined since</p>
              <p className="text-base">{formatDate(member.joinedAt)}</p>
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

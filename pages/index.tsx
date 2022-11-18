import { BlitzPage, Routes } from "@blitzjs/next"
import { useInfiniteQuery, useQuery } from "@blitzjs/rpc"
import { SearchIcon } from "@heroicons/react/solid"
import getAccountsByAddresses from "app/account/queries/getAccountsByAddresses"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import Layout from "../app/core/layouts/Layout"
import { RfpCard } from "app/rfp/components/RfpCard"
import getPaginatedRfps from "app/rfp/queries/getPaginatedRfps"
import { useCallback, useRef, useState } from "react"
import { Rfp } from "app/rfp/types"
import { RfpStatus } from "@prisma/client"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import useStore from "app/core/hooks/useStore"
import dynamic from "next/dynamic"

const RfpPreCreateModal = dynamic(() => import("app/rfp/components/RfpPreCreateModal"), {
  ssr: false,
})

const Home: BlitzPage = () => {
  const session = useSession({ suspense: false })
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const [isRfpPreCreateModalOpen, setIsRfpPreCreateModalOpen] = useState<boolean>(false)
  const [results, { isFetchingNextPage, fetchNextPage, hasNextPage }] = useInfiniteQuery(
    getPaginatedRfps,
    (
      page = {
        take: 12,
        where: { status: RfpStatus.OPEN },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          template: true,
          _count: {
            select: { proposals: true },
          },
        },
      }
    ) => page,
    {
      suspense: false,
      getNextPageParam: (lastPageResults, allPagesResults) => {
        return lastPageResults.nextPage
      },
    }
  )

  // Commenting this out until we have a list of active contributors to showcase
  // const [accounts] = useQuery(
  //   getAccountsByAddresses,
  //   {
  //     addresses: [
  //       "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  //       "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  //       "0x2Ae8c972fB2E6c00ddED8986E2dc672ED190DA06",
  //       "0xBb398Fd83126500E3f0afec6d4c69411576bc7FB",
  //       "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  //       "0x016562aA41A8697720ce0943F003141f5dEAe006",
  //       "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  //       "0x96F0F1Ddafae2C6bd0635D28BdbA6B959Fb99eea",
  //       "0xC3c74B36A7F7c3395c6D59086F5a49540ed180ED",
  //       "0x0b74007a73ca49c96C833ba0E38Aa929ba71c40f",
  //     ],
  //   },
  //   { suspense: false }
  // )

  // attach ref to last post so that when it's seen, we fetch
  // the next batch of paginated rfps
  const intObserver = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useCallback(
    (rfpCard) => {
      if (isFetchingNextPage) return null
      if (intObserver.current) intObserver.current.disconnect()

      intObserver.current = new IntersectionObserver((cards) => {
        if (cards[0]?.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (rfpCard) intObserver.current.observe(rfpCard)
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  )

  const rfpCards = results
    ? results?.map(({ rfps }) =>
        rfps.map((rfp, i) => {
          // if it's the last rfp, attach ref
          if (rfps.length === i + 1) {
            return (
              <RfpCard
                ref={lastPostRef}
                key={rfp.id}
                rfp={rfp as Rfp}
                href={Routes.ProposalRfpForm({
                  rfpId: rfp?.id,
                })}
              />
            )
          }
          return (
            <RfpCard
              key={rfp.id}
              rfp={rfp as Rfp}
              href={Routes.ProposalRfpForm({
                rfpId: rfp?.id,
              })}
            />
          )
        })
      )
    : Array.from(Array(12)).map((idx) => (
        <div
          key={idx}
          className="h-[170px] motion-safe:animate-pulse rounded bg-wet-concrete"
        ></div>
      ))

  return (
    <>
      {session.siwe?.address && isRfpPreCreateModalOpen && (
        <RfpPreCreateModal
          isOpen={isRfpPreCreateModalOpen}
          setIsOpen={setIsRfpPreCreateModalOpen}
          accountAddress={session.siwe?.address}
        />
      )}
      <main className="bg-scroll" style={{ backgroundImage: "url('/bg-hero-landing.webp')" }}>
        <div className="h-full mx-56">
          <div className="flex flex-col">
            <h1 className="text-center mt-20 font-bold text-marble-white text-4xl">
              Start collaborating today
            </h1>
            <div className="h-14 mt-11 w-full bg-wet-concrete rounded pl-4">
              <input
                ref={searchRef}
                className="text-center bg-wet-concrete h-full w-full inline rounded placeholder:text-lg"
                placeholder="Enter a wallet address or an ENS name"
              />
            </div>
            <Button
              className="h-[52px]"
              overrideWidthClassName="w-fit px-8 mx-auto mt-3"
              onClick={() =>
                router.push(
                  Routes.ProposalTypeSelection({
                    // pre-fill for both so that if user changes toggle to reverse roles, the input address is still there
                    clients: searchRef?.current?.value,
                    contributors: searchRef?.current?.value,
                  })
                )
              }
            >
              Create a proposal
            </Button>
          </div>
          <div className="my-10 px-6 mx-44 py-3 bg-wet-concrete-50 flex flex-row rounded items-center justify-between">
            <p>You can now also put a call out for contributors.</p>
            <Button
              onClick={() => {
                if (!session.siwe?.address) {
                  toggleWalletModal(true)
                } else {
                  setIsRfpPreCreateModalOpen(true)
                }
              }}
              type={ButtonType.Unemphasized}
              className="bg-wet-concrete-50 hover:bg-concrete"
            >
              Create an RFP
            </Button>
          </div>

          {/* Commenting this out until we have a list of active contributors to showcase*/}
          {/* <div className="mt-14">
          <h2 className="text-2xl mb-3">Featured active contributors</h2>
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-2">
            {accounts
              ? accounts?.map((account) => (
                  <div
                    key={account?.address}
                    tabIndex={0}
                    className="rounded-full bg-wet-concrete-50 p-3 w-fit hover:bg-wet-concrete cursor-pointer"
                  >
                    <AccountMediaObject account={account} />
                  </div>
                ))
              : Array.from(Array(10)).map((idx) => (
                  <div
                    key={idx}
                    className="rounded-full motion-safe:animate-pulse shadow bg-wet-concrete p-3 w-52 h-[68px] hover:bg-wet-concrete cursor-pointer"
                  ></div>
                ))}
          </div>
        </div> */}

          <div className="mt-14">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl mb-3">Open RFPs for work</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 sm:gap-2 md:gap-4 lg:gap-6 gap-1">
              {rfpCards}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home

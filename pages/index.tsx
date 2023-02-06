import { BlitzPage, Routes } from "@blitzjs/next"
import { invoke, useInfiniteQuery, useQuery } from "@blitzjs/rpc"
import { useCallback, useRef, useState } from "react"
import { Rfp } from "app/rfp/types"
import { useRouter } from "next/router"
import { useSession } from "@blitzjs/auth"
import getAccountsByAddresses from "app/account/queries/getAccountsByAddresses"
import AccountMediaObject from "app/core/components/AccountMediaObject"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import Layout from "../app/core/layouts/Layout"
import { RfpCard } from "app/rfp/components/RfpCard"
import getPaginatedRfps from "app/rfp/queries/getPaginatedRfps"
import useStore from "app/core/hooks/useStore"
import dynamic from "next/dynamic"
import { Account } from "app/account/types"
import { gSSP } from "app/blitz-server"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"

const RfpPreCreateModal = dynamic(() => import("app/rfp/components/RfpPreCreateModal"), {
  ssr: false,
})

export const getServerSideProps: GetServerSideProps = gSSP(async ({ params = {} }) => {
  const accounts = await invoke(getAccountsByAddresses, {
    addresses: [
      "0x0C528bA4964673a9187A6F7BEc96E8aFD3409a54", // tiny factories
      "0x332557dE221d09AD5b164a665c585fca0200b4B1", // foxes
      "0x96F0F1Ddafae2C6bd0635D28BdbA6B959Fb99eea", // tchard.eth
      "0xc517c83f417b73dA98647dad0FCB80af9f3b9531", // station
      "0x08C75DE5686923a93E6D1B0160E3ef4913c3F3f0", // polygon
      "0xEC41a0AAea12ad8F588e5aD0e71A837d83e05792", // popp.eth
      "0x8dca852d10c3CfccB88584281eC1Ef2d335253Fd", // cabindao
      "0xEAB32a423B3dA4049F1Ad379737fCf1f4F9a5137", // radicle
      "0xBb398Fd83126500E3f0afec6d4c69411576bc7FB", // blurryjpeg
      "0xf60B82309D90c0c90826266aaa22b00322C2f632", // the symmetrical
    ],
  })

  const rfps = await invoke(getPaginatedRfps, {
    take: 12,
  })

  return {
    props: { accounts, rfps: rfps.rfps }, // will be passed to the page component as props
  }
})

const Home: BlitzPage = ({
  accounts,
  rfps: ssrRfps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession({ suspense: false })
  const toggleWalletModal = useStore((state) => state.toggleWalletModal)
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const [isRfpPreCreateModalOpen, setIsRfpPreCreateModalOpen] = useState<boolean>(false)
  // const [results, { isFetchingNextPage, fetchNextPage, hasNextPage }] = useInfiniteQuery(
  //   getPaginatedRfps,
  //   (
  //     page = {
  //       take: 12,
  //     }
  //   ) => page,
  //   {
  //     suspense: false,
  //     getNextPageParam: (lastPageResults, allPagesResults) => {
  //       return lastPageResults.nextPage
  //     },
  //   }
  // )

  // const [accounts] = useQuery(
  //   getAccountsByAddresses,
  //   {
  //     addresses: [
  //       "0x0C528bA4964673a9187A6F7BEc96E8aFD3409a54", // tiny factories
  //       "0x332557dE221d09AD5b164a665c585fca0200b4B1", // foxes
  //       "0x96F0F1Ddafae2C6bd0635D28BdbA6B959Fb99eea", // tchard.eth
  //       "0xc517c83f417b73dA98647dad0FCB80af9f3b9531", // station
  //       "0x08C75DE5686923a93E6D1B0160E3ef4913c3F3f0", // polygon
  //       "0xEC41a0AAea12ad8F588e5aD0e71A837d83e05792", // popp.eth
  //       "0x8dca852d10c3CfccB88584281eC1Ef2d335253Fd", // cabindao
  //       "0xEAB32a423B3dA4049F1Ad379737fCf1f4F9a5137", // radicle
  //       "0xBb398Fd83126500E3f0afec6d4c69411576bc7FB", // blurryjpeg
  //       "0xf60B82309D90c0c90826266aaa22b00322C2f632", // the symmetrical
  //     ],
  //   },
  //   { suspense: false }
  // )

  // attach ref to last post so that when it's seen, we fetch
  // the next batch of paginated rfps

  // const intObserver = useRef<IntersectionObserver | null>(null)
  // const lastPostRef = useCallback(
  //   (rfpCard) => {
  //     if (isFetchingNextPage) return null
  //     if (intObserver.current) intObserver.current.disconnect()

  //     intObserver.current = new IntersectionObserver((cards) => {
  //       if (cards[0]?.isIntersecting && hasNextPage) {
  //         fetchNextPage()
  //       }
  //     })

  //     if (rfpCard) intObserver.current.observe(rfpCard)
  //   },
  //   [isFetchingNextPage, fetchNextPage, hasNextPage]
  // )

  const rfpCards =
    // results
    //   ? results?.map(({ rfps }) =>
    //       rfps.map((rfp, i) => {
    //         // if it's the last rfp, attach ref
    //         if (rfps.length === i + 1) {
    //           return (
    //             <RfpCard
    //               ref={lastPostRef}
    //               key={rfp.id}
    //               account={rfp.account as Account}
    //               rfp={rfp as Rfp}
    //               href={Routes.RfpDetail({
    //                 rfpId: rfp?.id,
    //               })}
    //             />
    //           )
    //         }
    //         return (
    //           <RfpCard
    //             key={rfp.id}
    //             account={rfp.account as Account}
    //             rfp={rfp as Rfp}
    //             href={Routes.RfpDetail({
    //               rfpId: rfp?.id,
    //             })}
    //           />
    //         )
    //       })
    //     )
    //   :
    ssrRfps?.map((rfp) => {
      console.log(rfp)
      return (
        <RfpCard
          key={rfp.id}
          account={rfp.account as Account}
          rfp={rfp as Rfp}
          href={Routes.RfpDetail({
            rfpId: rfp?.id,
          })}
        />
      )
    })
  // Array.from(Array(12)).map((idx) => (
  //   <div
  //     key={idx}
  //     className="h-[170px] motion-safe:animate-pulse rounded bg-wet-concrete"
  //   ></div>
  // ))

  return (
    <>
      {session.siwe?.address && isRfpPreCreateModalOpen && (
        <RfpPreCreateModal
          isOpen={isRfpPreCreateModalOpen}
          setIsOpen={setIsRfpPreCreateModalOpen}
          accountAddress={session.siwe?.address}
        />
      )}
      <main
        className="bg-cover bg-center bg-no-repeat h-screen w-screen"
        style={{ backgroundImage: "url('/bg-hero-landing.webp')" }}
      >
        <div className="h-full mx-10 lg:mx-56">
          <div className="flex flex-col">
            <h1
              aria-label="Propose to collaborate"
              className="h-[80px] md:h-fit text-center mt-20 font-bold bg-transparent text-marble-white text-4xl"
            >
              Propose to&nbsp;
              <span className="hidden md:inline typewriter nocaret" />
              <p className="block md:hidden">
                <span className="typewriter nocaret" />
              </p>
            </h1>
            <div className="hidden md:block h-fit w-fit md:h-16 mt-11 md:w-[733px] mx-auto rounded">
              <input
                ref={searchRef}
                className="outline-concrete rounded-r-none pl-3 bg-wet-concrete-50 border border-wet-concrete h-full w-[75%] inline rounded placeholder:text-lg"
                placeholder="Enter a recipient’s wallet address or an ENS name"
              />
              <Button
                className="md:rounded-l-none text-lg mx-auto"
                overrideHeightClassName="h-16"
                overrideWidthClassName="w-full md:w-[25%] mt-3 px-3"
                onClick={() =>
                  router.push(
                    Routes.ProposalNewFunding({
                      client: searchRef?.current?.value,
                      contributor: searchRef?.current?.value,
                    })
                  )
                }
              >
                Create a proposal
              </Button>
            </div>
          </div>
          <div className="hidden my-10 px-6 mx-auto md:w-[600px] py-3 md:bg-wet-concrete-50 md:flex flex-row rounded items-center md:justify-between">
            <p className="inline">You can now also put a call out for contributors.</p>
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

          <div className="mt-14">
            <h2 className="hidden md:block text-2xl font-bold mb-3">Propose to collaborate</h2>
            <div className="hidden md:flex flex-row flex-wrap gap-x-2 gap-y-2">
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
          </div>

          <div className="mt-4 md:mt-14">
            <div className="flex flex-row justify-between">
              <h2 className="text-2xl mb-3 font-bold">Open RFPs for work</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 gap-3">
              {rfpCards}
            </div>
            {/* a buffer for the end of the infinite scroll */}
            <div className="h-10" />
          </div>
        </div>
      </main>
    </>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home

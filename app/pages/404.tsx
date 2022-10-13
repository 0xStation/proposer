import Button from "app/core/components/sds/buttons/Button"
import Layout from "app/core/layouts/Layout"
import { Head, useRouter, Routes } from "blitz"

// ------------------------------------------------------
// This page is rendered if a route match is not found
// ------------------------------------------------------
export default function Page404() {
  const statusCode = 404
  const title = "This page could not be found."
  const router = useRouter()
  return (
    <div className="bg-tunnel-black h-screen w-full">
      <Head>
        <title>
          {statusCode}: {title}
        </title>
      </Head>
      <Layout>
        <div className="text-marble-white flex flex-col h-full w-full justify-center text-center align-middle">
          <div>
            <h1 className="text-4xl font-bold">{statusCode}</h1>
            <p className="mt-3">{title}</p>
            <Button className="mt-10 max-w-fit" onClick={() => router.push(Routes.Explore())}>
              Find workspaces on Station
            </Button>
          </div>
        </div>
      </Layout>
    </div>
  )
}

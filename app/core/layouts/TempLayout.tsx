import { Head, BlitzLayout } from "blitz"
import TempNavigation from "../components/TempNavigation"
import ModalContainer from "../components/ModalContainer"
import ToastContainer from "../components/ToastContainer"

const TempLayout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "Station"}</title>
        <link rel="icon" href="/station-logo-favicon.ico" />
        <meta name="description" content="Doing work with people who share your mission." />
        <meta name="twitter:site" content="@0xStation" />
        <meta name="twitter:title" content="STATION" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="twitter:description"
          content="Toolkit for digital orgs to curate and reward the best people and projects."
        />
        <link rel="apple-touch-icon" href="/station-logo-favicon.ico" />
      </Head>
      <ModalContainer />
      <ToastContainer />
      <TempNavigation>{children}</TempNavigation>
    </>
  )
}

export default TempLayout
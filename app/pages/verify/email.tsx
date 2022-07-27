import {
  BlitzPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
  invoke,
  useMutation,
  useSession,
  useRouter,
  Routes,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import verifyEmail from "app/email/mutations/verifyEmail"
import { useState } from "react"

const VIEW_CONSTANTS = {
  INVALID: "INVALID",
  EMAIL_VERIFICATION_SUCCESS: "EMAIL_VERIFICATION_SUCCESS",
  VERIFICATION_SENT: "VERIFICATION_SENT",
  ERROR: "ERROR",
  LOADING: "LOADING",
}

type ViewContent = {
  heading?: string
  subheading?: string
  cta?: any
  ctaTitle?: string
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.code) {
    return {
      props: {
        invalidLink: true,
      },
    }
  }

  const verifiedEmail = await invoke(verifyEmail, {
    verificationCode: query.code,
  })

  return {
    props: {
      verified: !!verifiedEmail,
    }, // will be passed to the page component as props
  }
}

const EmailVerificationView = ({ heading, subheading, ctaTitle, cta }: ViewContent) => {
  return (
    <Layout title="Verify your email">
      <div className="w-full h-full flex items-center flex-col mt-20 sm:justify-center sm:mt-0">
        <h1 className="text-2xl font-bold text-marble-white text-center w-[295px]">{heading}</h1>
        <p className="mt-2 mb-6 w-72 text-center">{subheading}</p>
        {cta && (
          <button
            className="text-tunnel-black bg-electric-violet rounded h-[35px] px-6"
            onClick={cta}
          >
            {ctaTitle}
          </button>
        )}
      </div>
    </Layout>
  )
}

const EmailVerification: BlitzPage = ({
  invalidLink,
  verified,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { INVALID, EMAIL_VERIFICATION_SUCCESS, VERIFICATION_SENT, ERROR, LOADING } = VIEW_CONSTANTS
  const [viewState, setViewState] = useState<string>(
    invalidLink || !verified ? INVALID : EMAIL_VERIFICATION_SUCCESS
  )
  const session = useSession({ suspense: false })
  const router = useRouter()
  const [sendVerificationEmailMutation] = useMutation(sendVerificationEmail, {
    onError: (error) => {
      setViewState(ERROR)
    },
  })

  const VIEW_CONTENT = {
    [INVALID]: {
      heading: "Invalid link",
      subheading: "Validate your email again here.",
      ctaTitle: "Try again",
      cta: async () => {
        const emailSent = await sendVerificationEmailMutation({
          accountId: session?.userId as number,
        })

        if (!emailSent) {
          setViewState("ERROR")
        } else {
          setViewState("VERIFICATION_SENT")
        }
      },
    },
    [EMAIL_VERIFICATION_SUCCESS]: {
      heading: "Email verified",
      subheading: "You'll now receive updates about your proposals.",
      ctaTitle: "Go to your profile",
      cta: () =>
        router.push(Routes.ProfileHome({ accountAddress: session?.siwe?.address as string })),
    },
    [VERIFICATION_SENT]: {
      heading: "Verification sent",
      subheading: "Please check your email to verify.",
      ctaTitle: "",
      cta: undefined,
    },
    [ERROR]: {
      heading: "Something went wrong",
      subheading: "Sorry there's was an error verifying your email. Please check back again later.",
      ctaTitle: "",
      cta: undefined,
    },
    [LOADING]: {
      heading: "...Loading",
      subheading: "",
      ctaTitle: "",
      cta: undefined,
    },
  }

  return <EmailVerificationView {...(VIEW_CONTENT[viewState] as ViewContent)} />
}

EmailVerification.suppressFirstRenderFlicker = true

export default EmailVerification

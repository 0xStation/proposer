import { useQuery, invoke, useMutation } from "@blitzjs/rpc"
import { BlitzPage, useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import { useInbox } from "app/inbox/hooks/useInbox"
import { Form } from "react-final-form"
import { getNetworkTokens } from "app/core/utils/networkInfo"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import createCheck from "app/check/mutations/createCheck"
import { preparePaymentTransaction } from "app/transaction/payments"
import { CheckStatus, CheckType } from "app/check/types"
import { AddressField } from "app/core/components/form/AddressField"
import { SelectTokenField } from "app/core/components/form/SelectTokenField"
import WhenFieldChanges from "app/core/components/WhenFieldChanges"
import { TokenAmountField } from "app/core/components/form/TokenAmountField"
import TextareaField from "app/core/components/form/TextareaField"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { useCheck } from "app/check/hooks/useCheck"
import { CheckDetails } from "app/check/components/CheckDetails"
import { useState } from "react"
import useCheckStatus from "app/check/hooks/useCheckStatus"
import { useIsUserSigner } from "app/safe/hooks/useIsUserSigner"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { useSignCheck } from "app/check/hooks/useSignCheck"
import { useExecuteCheck } from "app/check/hooks/useExecuteCheck"
import { CheckStatusIndicator } from "app/check/components/CheckStatusIndicator"
import SeeTransaction from "app/core/components/SeeTransaction"
import { formatDate } from "app/core/utils/formatDate"
import { CheckHeader } from "app/check/components/CheckHeader"

const ViewRequest: BlitzPage = () => {
  const checkId = useParam("requestId", "string") as string

  const { check } = useCheck(checkId)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { status } = useCheckStatus({ check })

  const userIsSigner = useIsUserSigner({
    chainId: check?.chainId,
    safeAddress: check?.address,
    userAddress: activeUser?.address,
  })
  const userHasSigned = check?.proofs
    ?.map((proof) => proof.signature)
    ?.some((signature) => addressesAreEqual(signature.signer, activeUser?.address))

  const { signCheck } = useSignCheck({ checks: [check], setIsLoading })
  const { executeCheck } = useExecuteCheck({ check, setIsLoading })

  return (
    <div className="w-1/2 mx-auto mt-12">
      <CheckHeader check={check} />
      <CheckDetails check={check} className="mt-4" />
      {userIsSigner ? (
        status === CheckStatus.PENDING ? (
          userHasSigned ? (
            <Button className="mt-8" isDisabled={true} type={ButtonType.Unemphasized}>
              Signed
            </Button>
          ) : (
            <Button onClick={signCheck} isLoading={isLoading} className="mt-8">
              Sign Check
            </Button>
          )
        ) : status === CheckStatus.READY ? (
          <Button onClick={executeCheck} isLoading={isLoading} className="mt-8">
            Execute Check
          </Button>
        ) : (
          <></>
        )
      ) : (
        <></>
      )}
    </div>
  )
}

ViewRequest.getLayout = function getLayout(page) {
  // persist layout between pages https://nextjs.org/docs/basic-features/layouts
  return (
    <Layout title="View Request">
      <div className="p-5 md:p-10 w-full max-h-screen overflow-y-auto">{page}</div>
    </Layout>
  )
}

ViewRequest.suppressFirstRenderFlicker = true

export default ViewRequest

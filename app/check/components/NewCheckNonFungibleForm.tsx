import { useState } from "react"
import { Form } from "react-final-form"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { useParam } from "@blitzjs/next"
import { RadioGroup } from "@headlessui/react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import createCheck from "../mutations/createCheck"
import { prepareERC721TransferTransaction } from "app/transaction/transfers"
import { CheckType } from "../types"
import { useResolveEnsAddress } from "app/proposalForm/hooks/useResolveEnsAddress"
import GetERC721ByAddress from "app/token/queries/getERC721ByAddress"
import { TextField } from "app/core/components/form/TextField"
import { AddressField } from "app/core/components/form/AddressField"

export const NewCheckNonFungibleForm = ({ goBack, onCreate }) => {
  const checkbookChainId = useParam("chainId", "number") as number
  const checkbookAddress = useParam("address", "string") as string
  const [selection, setSelection] = useState<string | null>()
  const { resolveEnsAddress } = useResolveEnsAddress()

  const [createCheckMutation, { isLoading }] = useMutation(createCheck, {
    onSuccess: (check) => {
      console.log("check", check)
      onCreate()
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const [nfts] = useQuery(
    GetERC721ByAddress,
    { address: checkbookAddress, chainId: checkbookChainId },
    {
      suspense: false,
      refetchOnWindowFocus: false,
    }
  )

  return (
    <>
      <h1 className="text-2xl font-bold">Transfer non fungible tokens (ERC721)</h1>
      <Form
        initialValues={{}}
        onSubmit={async (values, form) => {
          const selectedNFT = nfts.find((nft) => {
            return nft.token.tokenId === selection
          })

          const recipient = await resolveEnsAddress(values.recipientAddress?.trim())
          const { to, value, data } = prepareERC721TransferTransaction(
            checkbookAddress,
            recipient!,
            selectedNFT.token.collectionAddress,
            selectedNFT.token.tokenId // same as selection, but this is more readable
          )

          createCheckMutation({
            chainId: checkbookChainId,
            address: checkbookAddress,
            title: values.title,
            to: to,
            value: value.toString(),
            data: data,
            operation: 0,
            meta: {
              type: CheckType.NonFungibleTransfer,
              token: {
                chainId: checkbookChainId,
                address: selectedNFT.token.collectionAddress,
                type: selectedNFT.token.tokenStandard,
                name: selectedNFT.token.name,
                tokenId: selectedNFT.token.tokenId,
                imageUrl: selectedNFT.token.image?.url,
              },
              recipient,
            },
          })
        }}
        render={({ form, handleSubmit }) => {
          const formState = form.getState()
          return (
            <form onSubmit={handleSubmit}>
              <TextField
                title="Title*"
                fieldName="title"
                placeholder="Enter a few words for accounting"
              />
              <RadioGroup value={selection} onChange={setSelection}>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {nfts?.map((nft, idx) => {
                    return (
                      <RadioGroup.Option value={nft.token.tokenId} key={idx}>
                        {({ checked }) => (
                          <div
                            key={`nft-${idx}`}
                            className={`col-span-1 p-2 rounded cursor-pointer ${
                              checked ? "bg-light-concrete" : "bg-charcoal hover:bg-wet-concrete"
                            }`}
                          >
                            <img src={nft.token.image?.url} />
                            <p className="text-xs mt-2">{`${nft.token.name} #${nft.token.tokenId}`}</p>
                          </div>
                        )}
                      </RadioGroup.Option>
                    )
                  })}
                </div>
              </RadioGroup>
              {/* RECIPIENT */}
              <AddressField title="Recipient*" fieldName="recipientAddress" />
              {/* BUTTONS */}
              <div className="mt-12 flex justify-between">
                <Button type={ButtonType.Unemphasized} onClick={goBack}>
                  Back
                </Button>
                <Button isSubmitType={true} isLoading={isLoading} isDisabled={formState.invalid}>
                  Next
                </Button>
              </div>
            </form>
          )
        }}
      />
    </>
  )
}

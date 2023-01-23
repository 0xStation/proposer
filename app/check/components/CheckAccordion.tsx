import React, { RefObject } from "react"
import { CheckDetails } from "./CheckDetails"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@heroicons/react/solid"
import { FungibleTransferDetails } from "./FungibleTransferDetails"
import { CheckStatusIndicator } from "./CheckStatusIndicator"
import { formatDate } from "app/core/utils/formatDate"
import { NonFungibleTransferDetails } from "./NonFungibleTransferDetails"
import { CheckType } from "../types"

const AccordionTrigger = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <Accordion.Header className="align-center w-full">
    <Accordion.Trigger {...props} ref={forwardedRef as RefObject<HTMLButtonElement>}>
      {children}
      <ChevronDownIcon
        className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100 my-4 transition-transform"
        aria-hidden="true"
      />
    </Accordion.Trigger>
  </Accordion.Header>
))

const AccordionContent = React.forwardRef(({ children, ...props }, forwardedRef) => (
  <Accordion.Content className={""} {...props} ref={forwardedRef as RefObject<HTMLDivElement>}>
    <div className="w-full">{children}</div>
  </Accordion.Content>
))

export const CheckAccordion = ({ check, idx }) => {
  const accordionItem = "w-full border-b border-concrete"
  const accordionContent = "p-8 border-t border-concrete text-marble-white"
  const accordionTrigger =
    "flex flex-row m-2 w-full justify-between [&_svg]:data-[state='open']:rotate-180"

  return (
    <Accordion.Item className={accordionItem} value={`item-${idx}`}>
      {/* @ts-ignore */}
      <AccordionTrigger className={accordionTrigger}>
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <div className="text-base text-concrete text-left py-4 w-8">{check.nonce}</div>
            <div className="py-4 w-24 text-left">
              <CheckStatusIndicator check={check} hideCounter={true} />
            </div>
            <div className="text-base py-4 ">
              {check.data.title.length > 44
                ? check.data.title.substr(0, 44) + "..."
                : check.data.title}
            </div>
          </div>
          <div className="text-sm py-4 text-concrete">{formatDate(check.createdAt)}</div>
        </div>
      </AccordionTrigger>
      {/* @ts-ignore */}
      <AccordionContent className={accordionContent}>
        {check.data.meta.type === CheckType.FungibleTransfer ? (
          <FungibleTransferDetails
            sender={check.address}
            recipient={check.data.meta.recipient!}
            token={check.data.meta.token!}
            amount={check.data.meta.amount!}
          />
        ) : check.data.meta.type === CheckType.NonFungibleTransfer ? (
          <NonFungibleTransferDetails
            sender={check.address}
            recipient={check.data.meta.recipient!}
            token={check.data.meta.token!}
          />
        ) : (
          <></>
        )}
      </AccordionContent>
    </Accordion.Item>
  )
}

export default CheckAccordion

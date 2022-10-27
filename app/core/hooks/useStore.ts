import create from "zustand"
import { Account } from "../../account/types"
import { Chain } from "wagmi"

interface StoreState {
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  executePaymentModalOpen: boolean
  proposalApprovalModalOpen: boolean
  sendProposalModalOpen: boolean
  toastState: {
    isToastShowing: boolean
    message: string
    type: "success" | "error"
  }
  activeChain: Chain | undefined
  toggleWalletModal: (boolean) => void
  toggleAccountModal: (boolean) => void
  toggleExecutePaymentModalOpen: (boolean) => void
  toggleProposalApprovalModalOpen: (boolean) => void
  toggleSendProposalModalOpen: (boolean) => void
  setToastState: (toastState: any) => void
  setActiveUser: (user: undefined | Account | null) => void
  setActiveChain: (chain: Chain | undefined) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: undefined, // undefined on start, Account if found, null if not found
  walletModalOpen: false,
  accountModalOpen: false,
  executePaymentModalOpen: false,
  proposalApprovalModalOpen: false,
  sendProposalModalOpen: false,
  activeChain: undefined,
  toastState: {
    isToastShowing: false,
    message: "",
    type: "success",
  },
  setActiveChain: (state) => {
    set(() => {
      return { activeChain: state }
    })
  },
  toggleWalletModal: (state) => {
    set(() => {
      return { walletModalOpen: state }
    })
  },
  toggleAccountModal: (state) => {
    set(() => {
      return { accountModalOpen: state }
    })
  },
  toggleExecutePaymentModalOpen: (state) => {
    set(() => {
      return { executePaymentModalOpen: state }
    })
  },
  toggleProposalApprovalModalOpen: (state) => {
    set(() => {
      return { proposalApprovalModalOpen: state }
    })
  },
  toggleSendProposalModalOpen: (state) => {
    set(() => {
      return { sendProposalModalOpen: state }
    })
  },
  setToastState: (toastState) =>
    set((state) => ({
      toastState: {
        isToastShowing: toastState.isToastShowing,
        message: toastState.message,
        type: toastState.type,
      },
    })),
  setActiveUser: (user) =>
    set(() => {
      return { activeUser: user }
    }),
}))

export default useStore

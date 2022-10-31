import create from "zustand"
import { Account } from "../../account/types"
import { Chain } from "wagmi"

interface StoreState {
  activeUser: undefined | Account | null
  walletModalOpen: boolean
  accountModalOpen: boolean
  executePaymentModalMap: any
  queueGnosisTransactionModalMap: any
  approveGnosisTransactionModalMap: any
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
  toggleApproveGnosisTransactionModalMap: ({ open, id }) => void
  toggleQueueGnosisTransactionModalMap: ({ open, id }) => void
  toggleExecutePaymentModalMap: ({ open, id }) => void
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
  approveGnosisTransactionModalMap: {},
  queueGnosisTransactionModalMap: {},
  executePaymentModalMap: {},
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
  toggleApproveGnosisTransactionModalMap: ({ open, id }) => {
    set((state) => {
      return {
        approveGnosisTransactionModalMap: {
          ...state.approveGnosisTransactionModalMap,
          [id]: open,
        },
      }
    })
  },
  toggleQueueGnosisTransactionModalMap: ({ open, id }) => {
    set((state) => {
      return {
        queueGnosisTransactionModalMap: {
          ...state.queueGnosisTransactionModalMap,
          [id]: open,
        },
      }
    })
  },
  toggleExecutePaymentModalMap: ({ open, id }) => {
    set((state) => {
      return {
        executePaymentModalMap: {
          ...state.executePaymentModalMap,
          [id]: open,
        },
      }
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

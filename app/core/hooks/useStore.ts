import create from "zustand"
import { Account } from "../../account/types"

interface StoreState {
  activeUser: Account | null
  setActiveUser: (user: Account | null) => void
}

const useStore = create<StoreState>((set) => ({
  activeUser: null,
  setActiveUser: (user) =>
    set(() => {
      return { activeUser: user }
    }),
}))

export default useStore

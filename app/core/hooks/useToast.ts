import useStore from "./useStore"

export const useToast = () => {
  const setToastState = useStore((state) => state.setToastState)

  const successToast = (message: string) => {
    setToastState({
      isToastShowing: true,
      type: "success",
      message,
    })
  }

  const errorToast = (message: string) => {
    setToastState({
      isToastShowing: true,
      type: "error",
      message,
    })
  }

  return { successToast, errorToast }
}

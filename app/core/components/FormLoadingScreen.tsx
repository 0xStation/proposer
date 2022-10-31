import { Spinner } from "app/core/components/Spinner"

export const FormLoadingScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-48">
      <p className="text-marble-white tracking-wide">Check your wallet for your next action...</p>
      <div className="h-4 w-4 mt-6">
        <Spinner fill="white" />
      </div>
    </div>
  )
}

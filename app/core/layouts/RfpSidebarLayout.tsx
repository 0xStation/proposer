import { RfpSidebar } from "app/rfp/components/RfpSidebar"

export const RfpSidebarLayout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <RfpSidebar />
      <div className="w-full px-6 md:px-10 max-h-screen overflow-y-auto">{children}</div>
    </div>
  )
}

export default RfpSidebarLayout

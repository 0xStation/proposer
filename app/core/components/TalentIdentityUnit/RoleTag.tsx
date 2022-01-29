export const RoleTag = ({ role }) =>
  role ? (
    <div className="rounded-full bg-electric-violet/20 h-[17px] w-fit p-2.5 flex flex-center items-center">
      <div className="text-electric-violet font-bold text-center text-[10px]">{role}</div>
    </div>
  ) : (
    <p className="text-marble-white">N/A</p>
  )
export default RoleTag

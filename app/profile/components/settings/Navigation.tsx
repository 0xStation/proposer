import { useRouter, Routes, Link, Image } from "blitz"
import Exit from "public/exit-button.svg"

const Navigation = ({ children, activeUser }) => {
  const router = useRouter()

  return (
    <div>
      <div className="absolute top-5 left-5">
        <div className="w-[16px] h-[16px]">
          <button
            className="text-marble-white"
            onClick={() => router.push(`/profile/${activeUser?.address}`)}
          >
            <Image src={Exit} alt="Close button" width={16} height={16} />
          </button>
        </div>
      </div>
      <main className="text-marble-white min-h-screen flex flex-row">
        <nav className="w-[70px]"></nav>
        <section className="w-[300px] border-r border-concrete p-6">
          <label className="font-bold text-sm text-marble-white uppercase tracking-wider">
            Edit Profile
          </label>
          <ul className="mt-6">
            <li
              className={`${
                router.pathname === Routes.EditProfile().pathname
                  ? "text-marble-white font-bold"
                  : "text-concrete"
              } cursor-pointer hover:text-marble-white`}
            >
              <Link href={Routes.EditProfile()}>Overview</Link>
            </li>
          </ul>
          <ul className="mt-4">
            <li
              className={`${
                router.pathname === Routes.EditProfileApps().pathname
                  ? "text-marble-white font-bold"
                  : "text-concrete"
              } cursor-pointer hover:text-marble-white`}
            >
              <Link href={Routes.EditProfileApps()}>Apps</Link>
            </li>
          </ul>
        </section>
        <section className="flex-1">{children}</section>
      </main>
    </div>
  )
}

export default Navigation

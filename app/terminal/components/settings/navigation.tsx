import { useParam, useRouter, Routes, Link, Image, Router } from "blitz"
import Exit from "/public/exit-button.svg"

const Navigation = ({ children }) => {
  const terminalHandle = useParam("terminalHandle") as string
  const router = useRouter()

  return (
    <main className="text-marble-white min-h-screen flex flex-row">
      <div className="absolute top-4 left-4 cursor-pointer">
        <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>
          <Image src={Exit} alt="Close button" width={12} height={12} />
        </Link>
      </div>
      <nav className="w-[70px]"></nav>
      <section className="w-[300px] border-r border-concrete p-6">
        <div className="fixed">
          <Link href={Routes.MemberDirectoryPage({ terminalHandle })}>
            <label className="font-bold text-sm text-marble-white uppercase tracking-wider cursor-pointer">
              {terminalHandle}
            </label>
          </Link>

          <ul className="mt-6">
            <li
              className={`${
                router.pathname === Routes.TerminalSettingsPage({ terminalHandle }).pathname
                  ? "text-marble-white font-bold"
                  : "text-concrete"
              } cursor-pointer hover:text-marble-white`}
            >
              <Link href={Routes.TerminalSettingsPage({ terminalHandle })}>Overview</Link>
            </li>
          </ul>

          <label className="font-bold text-sm text-marble-white uppercase tracking-wider mt-8 block">
            Integrations
          </label>
          <ul className="mt-6">
            <li
              className={`${
                router.pathname === Routes.DiscordSettingsPage({ terminalHandle }).pathname
                  ? "text-marble-white font-bold"
                  : "text-concrete"
              } cursor-pointer hover:text-marble-white`}
            >
              <Link href={Routes.DiscordSettingsPage({ terminalHandle })}>Discord</Link>
            </li>
          </ul>
        </div>
      </section>
      <section className="flex-1">{children}</section>
    </main>
  )
}

export default Navigation

import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/mark";
import { NavLink } from "@/components/nav-link";
import { signOut } from "@/lib/auth-actions";

type Props = { login: string | null; name: string; image: string | null };

export function AppHeader({ login, name, image }: Props) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <div className="flex items-center gap-6 sm:gap-10">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-sm text-on-cloth">
          <Mark className="size-10 shrink-0" label="Job Not Finished" />
          <span className="hidden font-display text-lg leading-none font-extrabold tracking-[0.12em] uppercase md:inline">
            Job Not Finished
          </span>
        </Link>
        <nav aria-label="App" className="flex items-center gap-5 text-sm font-semibold">
          <NavLink href="/dashboard">Catalog</NavLink>
          <NavLink href="/settings">Settings</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden items-center gap-2.5 text-on-cloth-muted sm:inline-flex">
          {image && (
            <Image
              src={image}
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-sm ring-1 ring-on-cloth/30"
            />
          )}
          {login ? `@${login}` : name}
        </span>
        <form action={signOut}>
          <button type="submit" className="link-cloth cursor-pointer">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

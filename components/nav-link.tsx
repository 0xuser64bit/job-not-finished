"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const current = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="text-on-cloth-muted decoration-2 underline-offset-[0.4em] hover:text-on-cloth aria-[current=page]:text-on-cloth aria-[current=page]:underline"
    >
      {children}
    </Link>
  );
}

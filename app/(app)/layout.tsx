import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <AppHeader login={user.githubLogin} name={user.name} image={user.image} />
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6">{children}</main>
      <SiteFooter />
    </>
  );
}

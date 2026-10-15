import type { Metadata } from "next";
import Link from "next/link";
import { setDigest, setPublicRecord } from "@/app/(app)/settings/actions";
import { CloseCardForm, CopyLink, EmailForm } from "@/components/settings-forms";
import { deliverable } from "@/lib/digest";
import { pendingEmailChange } from "@/lib/email-change";
import { appUrl } from "@/lib/env";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/\W+/g, "-");
  return (
    <section aria-labelledby={id} className="stock grid gap-5 px-6 py-7 sm:px-8">
      <h2
        id={id}
        className="font-display text-[1.6rem] leading-none font-extrabold tracking-[0.04em] uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Toggle({
  action,
  on,
  children,
}: {
  action: (f: FormData) => Promise<void>;
  on: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="on" value={on ? "1" : "0"} />
      <button type="submit" className="btn btn-slip">
        {children}
      </button>
    </form>
  );
}

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await requireUser();
  const { email: emailResult } = await searchParams;
  const pending = await pendingEmailChange(user.id);
  const address =
    user.digestEmail ?? (user.emailVerified && deliverable(user.email) ? user.email : null);
  const publicUrl = user.githubLogin ? `${appUrl}/u/${user.githubLogin}` : null;

  return (
    <div className="mx-auto grid max-w-[44rem] gap-8">
      <h1 className="font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-none font-extrabold text-on-cloth uppercase">
        Settings
      </h1>

      {emailResult === "confirmed" && (
        <p role="status" className="stock stock-manila typed px-5 py-3 font-bold text-green">
          Address confirmed. Notices go there from now on.
        </p>
      )}
      {emailResult === "expired" && (
        <p role="alert" className="stock stock-manila typed px-5 py-3 font-bold text-red">
          That confirmation link expired or was already used. Ask for a new one below.
        </p>
      )}

      <Sheet title="Weekly notices">
        <div className="typed grid gap-2 text-[0.95rem] leading-7">
          {!address ? (
            <p className="font-bold text-red">
              GitHub didn&apos;t share an address we can send to. Add one below to get notices.
            </p>
          ) : user.digestEnabled ? (
            <p>
              Every Sunday, about the projects you have checked out, to <strong>{address}</strong>
              {user.digestEmail ? " (confirmed)." : " (from GitHub)."}
            </p>
          ) : (
            <p>
              Paused. Nothing will be sent to <strong>{address}</strong> until you resume.
            </p>
          )}
          {pending && <p className="text-ink-muted">Waiting for {pending} to confirm.</p>}
        </div>
        {address && (
          <Toggle action={setDigest} on={!user.digestEnabled}>
            {user.digestEnabled ? "Pause notices" : "Resume notices"}
          </Toggle>
        )}
        <div className="border-t border-dashed border-ink/30 pt-5">
          <EmailForm />
        </div>
      </Sheet>

      <Sheet title="Public record">
        <p className="typed text-[0.95rem] leading-7">
          Share your borrower record: how much is overdue, what&apos;s on loan, what you&apos;ve
          returned and withdrawn. Off unless you turn it on.
        </p>
        {publicUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <Toggle action={setPublicRecord} on={!user.publicProfile}>
              {user.publicProfile ? "Make it private" : "Make it public"}
            </Toggle>
            {user.publicProfile && (
              <>
                <CopyLink url={publicUrl} />
                <Link
                  href={`/u/${user.githubLogin}`}
                  className="typed text-[0.9rem] underline underline-offset-2"
                >
                  View it
                </Link>
              </>
            )}
          </div>
        ) : (
          <p className="typed text-ink-muted">Available after your first sync with GitHub.</p>
        )}
      </Sheet>

      <Sheet title="Close your card">
        <p className="typed text-[0.95rem] leading-7">
          Deletes your account, your projects, and the GitHub token we hold, and removes Job Not
          Finished from your authorized apps on GitHub. There&apos;s no undo.
        </p>
        <CloseCardForm expected={user.githubLogin ?? "close my card"} />
      </Sheet>
    </div>
  );
}

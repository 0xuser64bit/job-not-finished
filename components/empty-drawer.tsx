import Link from "next/link";
import { Stamp, type Ink } from "@/components/stamp";

type Props = {
  stamp: string;
  ink: Ink;
  children: React.ReactNode;
  action?: { href: string; label: string };
};

/** What an empty drawer says. */
export function EmptyDrawer({ stamp, ink, children, action }: Props) {
  return (
    <div className="stock mx-auto flex max-w-[34rem] flex-col items-center px-6 py-12 text-center">
      <Stamp ink={ink} tilt={-5} className="text-[1.6rem]">
        {stamp}
      </Stamp>
      <p className="typed mt-6 max-w-[26rem] text-[0.95rem] leading-7">{children}</p>
      {action && (
        <Link href={action.href} className="btn btn-slip btn-slip-solid mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

import { cn } from "@/lib/cn";

const INK = {
  violet: "text-violet",
  red: "text-red",
  green: "text-green",
  black: "text-black",
} as const;

export type Ink = keyof typeof INK;

type Props = {
  ink?: Ink;
  /** Degrees; real stamps never land straight. */
  tilt?: number;
  /** Text only, no frame (dates). */
  bare?: boolean;
  /** Slam in on mount, after `delay` ms. */
  animate?: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
};

/** A rubber-stamp impression. Only meaningful on card stock (it multiplies). */
export function Stamp({
  ink = "violet",
  tilt = -4,
  bare,
  animate,
  delay = 0,
  className,
  children,
}: Props) {
  return (
    <span
      className={cn("stamp", INK[ink], bare && "stamp-bare", animate && "animate-stamp", className)}
      style={
        {
          "--tilt": `${tilt}deg`,
          animationDelay: delay ? `${delay}ms` : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

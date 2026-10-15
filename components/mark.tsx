import { useId } from "react";

/**
 * The brand mark: a round library ownership stamp. Inherits color, so it
 * works as manila on cloth or as ink on paper.
 */
export function Mark({ className, label }: { className?: string; label?: string }) {
  const ring = useId();
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <path id={ring} d="M60,60 m-42.5,0 a42.5,42.5 0 1,1 85,0 a42.5,42.5 0 1,1 -85,0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="56" strokeWidth="5" />
        <circle cx="60" cy="60" r="33" strokeWidth="2.2" />
      </g>
      <text
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="12"
        letterSpacing="1"
      >
        <textPath href={`#${ring}`} textLength="264" lengthAdjust="spacing">
          JOB NOT FINISHED • CIRCULATION DESK •
        </textPath>
      </text>
      <rect x="35" y="53" width="50" height="2.2" fill="currentColor" />
      <text
        x="60"
        y="76"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontWeight="900"
        fontSize="22"
        letterSpacing="1"
      >
        JNF
      </text>
      <rect x="35" y="80" width="50" height="2.2" fill="currentColor" />
    </svg>
  );
}

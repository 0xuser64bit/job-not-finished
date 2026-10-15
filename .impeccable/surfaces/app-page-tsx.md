---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief: landing page (and the world it establishes)

Scope: `/` marketing page. Mode: Persuade. The world chosen here also governs the app shell, dashboard (Operate), sign-in, welcome, settings, public borrower record, weekly email, and OG images.

Audience: developers with a GitHub account and a backlog of half-built public repos. Job: decide to face the backlog. Action: sign in with GitHub (read-only, public repos). Proof: the mechanism itself, shown with clearly-labelled sample data (sample slip, sample notice, live demo card); open source and self-hostable. Constraints: no invented users, testimonials, or pricing; no Kobe photo; free, MIT.

## Direction contract

THESIS: Every side project is a library book you checked out and never returned. The product is the circulation desk that keeps your record: it stamps every push, flags what is overdue, mails the notices, and stamps RETURNED when you ship. It refuses the dev-tool default of a dark gradient hero, dashboard screenshot, and bento feature grid.

OWN-WORLD: Library binding buckram (deep green, woven) is the ground on every surface. Content lives on card stock: manila date-due slips and catalog cards with pale-blue ruled lines and a red margin rule; kraft book pockets; pink stock for overdue notices. Ink is rubber stamp: violet for dates, red for OVERDUE, green for RETURNED, black for WITHDRAWN, each roughened like real rubber (uneven density, slight rotation, occasional double strike). Type: condensed stamped caps for display and stamps, typewriter for anything typed on a card, a civic sans for UI. The mark is a round library ownership stamp.

STORY: The visitor sees their own habit on a date-due slip, laughs at the OVERDUE stamp, understands that the product reads real push dates and mails a weekly roast, trusts it because it is read-only and open source, and signs in with GitHub to see their real record.

FIRST VIEWPORT: Full-bleed buckram. Left half: a tall date-due slip in its pocket at near-real scale, sample push dates stamped in violet down the ruled column, a red OVERDUE stamp slammed diagonally across the last rows, and the next empty row pre-inked with today's real date. Right half: the headline "Your side projects are overdue." in huge stamped manila caps, one sentence of mechanism, the primary action "Check your record with GitHub" as a manila library-card button, and a quiet "Read the source" link. The round stamp mark sits top-left. Signature interaction: stamps land one by one with a short thunk of motion; on the live demo card further down, "Return it" slams a RETURNED stamp. Motion grammar: stamps are the only motion; reduced motion shows them pre-inked.

FORM: The Date-Due Card, position 6 on the ordered list (transit board, parcel tracking, citation notice, vitals monitor, arena scoreboard, date-due card, LCD pet). Seed key 95422f95. Raises: every stamp is a measurement (real push dates, tabular figures); stamps ink like real rubber; colour is the sheet (one stock per surface); explicit lifecycle stamps (On loan, Overdue, Renewed, Returned, Withdrawn); the date stamp is set to today.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Production domain is configuration (APP URL env), not decided in code.

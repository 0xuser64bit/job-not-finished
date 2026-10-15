# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers with a GitHub account and a long tail of half-built side projects: indie hackers, students, and working engineers who start things on weekends and stall. They arrive knowing they have "a few" unfinished repos and are usually surprised by the real count. Their job: decide which projects are worth finishing, keep momentum on those, and be honest about the rest.

## Product Purpose

Job Not Finished reads a developer's public GitHub repositories, shows them the true state of their side-project backlog, and holds them accountable for the projects they commit to finishing. Users mark progress, flag projects for weekly reminders, and receive a weekly email that roasts them, using real commit activity, about the projects they've neglected. Success is a shipped project, or an honest decision to let one go.

## Positioning

An accountability layer on top of GitHub, not a project manager: no tasks, boards, or tickets. Its mechanism is the user's own commit history turned into tough-love feedback: "you haven't pushed to this in 41 days" is a fact, and the roast is built from it. Free, open source (MIT), and self-hostable, with read-only access to public repositories only.

## Operating Context

- Sign-in is GitHub OAuth only, with the minimal scopes (`read:user`, `user:email`). The app can never read private code or write to GitHub.
- The dashboard is visited in short bursts: after a weekly email, or when the developer feels guilty about a project.
- The weekly reminder is an email sent by a scheduled job (Sundays, 00:00 UTC on the hosted instance), one email per user covering every project they flagged.
- Progress is self-reported (0-100%). Activity (last push, stars, forks, open issues) comes from GitHub.
- Hosted instance plus self-hosting (Vercel, Postgres, Resend); self-hosters configure their own GitHub OAuth app, database, and email provider.

## Capabilities and Constraints

- Lists the user's own public repositories (forks identifiable), with search, language filter, and sorting.
- Per-project self-reported progress and a per-project reminder toggle.
- Activity-based roast lines in the app and in the weekly email; completion is celebrated.
- Light and dark themes.
- Public repositories only (confirmed product decision). Private repos are out of scope unless the permission model changes.
- No paid tier and no pricing page (confirmed). Do not imply one.
- Undecided: canonical production domain (code has referenced both `job-not-finished.vercel.app` and `job-not-finished.arthprajapati.com`); must be configuration, not hardcoded.

## Brand Commitments

- Name: **Job Not Finished**.
- Rallying cry: "Job's not finished." Kept as a phrase in copy. The Kobe Bryant press-conference photo is retired and must not be used anywhere (confirmed: likeness and broadcast-footage risk for a public launch). The brand gets an original mark.
- Voice: tough love. Roasts sting the project, never the person; funny, specific, grounded in real activity data, and always pointing back to "go ship it."
- Open source under MIT; repository at github.com/0xuser64bit/job-not-finished.

## Evidence on Hand

- Real product, previously live; old UI screenshot at `public/demo.png` (outdated, not reusable as proof).
- No testimonials, user counts, press, or benchmarks exist. Do not fabricate any ("join thousands of developers" was an invented claim and is removed).
- Demonstration repos, roasts, and stats on marketing surfaces must be clearly illustrative.

## Product Principles

1. Facts first, then the roast. Every nudge is grounded in the user's real GitHub activity.
2. Finishing beats starting. Every surface pushes toward shipping a project or honestly letting it go.
3. Ask for the least trust possible. Read-only, public-only, easy unsubscribe, easy account deletion.
4. Humor with a heart. Sting the procrastination, celebrate the ship.
5. Own your data. Open source, self-hostable, no dark patterns.

## Accessibility & Inclusion

WCAG 2.1 AA as the baseline: keyboard-complete flows, visible focus, reduced-motion support for celebrations and animations, and sound effects that never play without user intent.

# Contributing

Thanks for helping. Small, focused pull requests get merged fastest.

## Setup

Follow [Self-hosting](README.md#self-hosting) to get a local copy running. You need your own GitHub OAuth app pointing at `http://localhost:3000/api/auth/callback/github`. Leave `RESEND_API_KEY` unset and emails are printed to the terminal instead of sent.

## Before you open a pull request

```bash
bun run check   # lint, typecheck, unit tests
bun run build
```

CI runs the same steps.

## Where things live

| Path | What |
| --- | --- |
| `lib/lifecycle.ts` | Every project state change. Add new moves here, with a test. |
| `lib/roast.ts` | Roast lines and the rules that pick them. |
| `lib/sync.ts`, `lib/github.ts` | Mirroring public repos from GitHub. |
| `lib/digest.ts`, `lib/email/` | The weekly notice and its cron runner. |
| `app/(app)/` | Signed-in pages and their server actions. |
| `components/` | UI. `catalog-card.tsx` is the heart of it. |
| `app/globals.css` | Design tokens: cloth, card stock, stamp inks. |

## Conventions

- **Authorization lives in the data layer.** Every page and server action that touches user data calls `requireUser()` and scopes queries to that user's id. There is no middleware gate to lean on.
- **Validate at the boundary.** Server actions accept `unknown` and parse with zod.
- **Escape email output.** Build email markup with the `html` tag from `lib/email/html.ts`, which escapes every interpolation.
- **Stay in the world.** The UI is a library circulation desk: card stock, typewriter text, rubber stamps. New UI should feel like it belongs on that desk.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, and so on.

## Writing roast lines

New lines are welcome. They go in `lib/roast.ts`, under the bucket that matches the situation. Keep them short, specific, and about the project, never the person. `bun run test` checks that every template fills in cleanly.

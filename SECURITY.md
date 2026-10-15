# Security

Please report vulnerabilities privately through GitHub: **Security → Report a vulnerability** on this repository. Don't open a public issue.

Include what you found, how to reproduce it, and what an attacker could do with it. You'll get a reply within a few days, and credit in the fix if you'd like it.

In scope: the hosted instance at job-not-finished.vercel.app and this codebase. Out of scope: denial of service, rate limits on GitHub's side, and issues that need a compromised device or browser.

## What the app holds

- A GitHub OAuth access token per user, with `read:user` and `user:email` scopes only, encrypted at rest. It is never sent to the browser.
- GitHub profile basics, public repository metadata, and the progress and dates users enter.
- Email addresses for weekly notices. A new address must be confirmed through a one-time link before anything is sent to it.

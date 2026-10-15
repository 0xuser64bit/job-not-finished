---
name: Job Not Finished
description: A library circulation desk for unfinished GitHub side projects. Buckram cloth, card stock, rubber stamps.
colors:
  cloth: "#1c4a3a"
  cloth-deep: "#133629"
  cloth-raised: "#24594a"
  on-cloth: "#efe3c4"
  on-cloth-muted: "#a8c2b1"
  card: "#f5e9cd"
  manila: "#ecd7a4"
  notice: "#f6cdd2"
  kraft: "#c9a86c"
  rule: "#a7bfdc"
  margin: "#de8a85"
  ink: "#1c1a15"
  ink-muted: "#51493a"
  violet: "#4333a6"
  red: "#b01e24"
  green: "#1d6a43"
  black: "#23211c"
typography:
  display:
    fontFamily: "Big Shoulders, Avenir Next Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3.4rem, 8.5vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Big Shoulders, Avenir Next Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.01em"
  title:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  typed:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.88rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    letterSpacing: "0.18em"
  stamp:
    fontFamily: "Big Shoulders, Avenir Next Condensed, Arial Narrow, sans-serif"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.07em"
    fontFeature: "tnum"
rounded:
  slip: "2px"
  card: "3px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  card-gap: "24px"
  section: "96px"
components:
  button-card:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0.95rem 1.5rem 0.85rem"
    height: "3.25rem"
  button-slip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.slip}"
    padding: "0.5rem 0.75rem 0.4rem"
    height: "2.25rem"
  button-slip-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.card}"
    rounded: "{rounded.slip}"
    padding: "0.5rem 0.75rem 0.4rem"
    height: "2.25rem"
  field:
    textColor: "{colors.ink}"
    rounded: "{rounded.slip}"
    padding: "0.5rem 0.7rem"
    height: "2.5rem"
  drawer-tab-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    padding: "0.7rem 1rem 0.55rem"
  drawer-tab:
    textColor: "{colors.on-cloth-muted}"
    padding: "0.7rem 1rem 0.55rem"
  catalog-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  notice-sheet:
    backgroundColor: "{colors.notice}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Job Not Finished

## Overview

**Creative North Star: "The Date-Due Card"**

Every side project is a library book you checked out and never returned, and the app is the circulation desk that keeps your record. The page itself is the inside cover of a library-bound book: a field of deep green buckram cloth. Everything you read sits on a sheet of paper laid on that cloth: manila date-due slips, ruled catalog cards, pink overdue notices, a kraft book pocket. Every change of state is a rubber stamp: violet for dates and loans, red for overdue, green for returned, black for withdrawn.

The voice is tough love delivered by a librarian. Type is either stamped (condensed caps), typed (a typewriter face on cards), or set (a civic sans for interface prose on the cloth). Density is calm on the cloth and close on the cards, the way a desk looks: a few objects with a lot of detail on each. The system refuses the developer-tool default of dark gradients, glowing accents, and bento grids, and it never uses the retired Kobe Bryant photograph.

**Key Characteristics:**
- Deep green buckram is the ground on every surface; it is never white or cream.
- Readable content lives on card stock with a soft paper shadow.
- State is shown by stamps in four inks, each ink meaning one thing.
- Typewriter text for anything written on a card, with tabular figures for dates and counts.
- Stamps are the only thing that moves, apart from loading indicators.

## Colors

A drenched green ground, warm paper stocks on top, and four saturated stamp-pad inks that each carry one meaning.

### Primary
- **Library Buckram** (cloth, #1c4a3a): the page ground on every route, with a fine noise grain and a crosshatch weave. Deeper (cloth-deep) behind the page edge and for punched holes; raised (cloth-raised) for scrollbar thumbs.
- **Spine Foil** (on-cloth, #efe3c4): headings, lead text, and links set directly on the cloth.
- **Faded Foil** (on-cloth-muted, #a8c2b1): secondary text on the cloth, tinted from the green rather than gray.

### Secondary
- **Card Stock** (card, #f5e9cd): catalog cards, the borrower's card, forms, and every reading surface.
- **Manila** (manila, #ecd7a4): the library-card button and closing call-to-action sheets.
- **Notice Pink** (notice, #f6cdd2): overdue notices only, on the page and in email.
- **Kraft** (kraft, #c9a86c): the book pocket that holds the hero slip.

### Tertiary
- **Date Violet** (violet, #4333a6): date stamps, ON LOAN, RENEWED, the progress bookmark, focus rings on paper.
- **Overdue Red** (red, #b01e24): OVERDUE, NOTE labels, errors, and the slip's double rule.
- **Returned Green** (green, #1d6a43): RETURNED and confirmations.
- **Withdrawn Black** (black, #23211c): WITHDRAWN and closed-account stamps.

### Neutral
- **Typewriter Ribbon** (ink, #1c1a15): text on paper, solid slip buttons, button outlines.
- **Faded Ribbon** (ink-muted, #51493a): secondary typed text, labels, and metadata on paper.
- **Index Rule** (rule, #a7bfdc): the pale blue ruling on cards and slips.
- **Margin Rule** (margin, #de8a85): the single red margin line on catalog cards.

In dark mode ("lamp off") the cloth deepens and the stocks dim (card #ddcfae, manila #d5c08f, notice #dfb3b9, kraft #b6955c), and red and green darken (#951a1f, #175a39) so small stamped text stays above 4.5:1.

### Named Rules
**The One Stock Per Surface Rule.** Colour is the sheet, not the mark. The cloth is the ground, card stock holds content, pink stock is reserved for notices, kraft for the pocket. Never introduce a new paper color to decorate.

**The Ink Means State Rule.** Each stamp ink means exactly one thing: violet for dates and loans, red for overdue and errors, green for returned and confirmed, black for withdrawn. A stamp ink is never decoration.

**The Ink Stays On Paper Rule.** Stamps multiply into card stock. They never sit on the cloth; anything on the cloth is foil-colored type.

## Typography

**Display Font:** Big Shoulders (with Avenir Next Condensed, Arial Narrow, sans-serif)
**Body Font:** Public Sans (with ui-sans-serif, system-ui)
**Label/Mono Font:** Courier Prime (with Courier New, monospace)

**Character:** Condensed stamped caps for anything announced, a typewriter for anything recorded, and a plain civic sans for explaining. The pairing reads like a public library's paperwork.

### Hierarchy
- **Display** (800, clamp(3.4rem, 8.5vw, 6rem), 0.88): the landing headline only, uppercase, with the foil texture.
- **Headline** (800, clamp(2.4rem, 5vw, 3.6rem), 0.95): section and page headings on the cloth, uppercase, with the foil texture.
- **Title** (Courier Prime 700, 1.05rem, 1.5): project names and card headings.
- **Body** (Public Sans 400, 1.125rem, 1.625): lead and explanatory prose on the cloth, kept near 36rem wide.
- **Typed** (Courier Prime 400, 0.88rem, 1.5): descriptions, roast notes (italic), terms, and form text on paper.
- **Label** (Courier Prime 400, 0.66–0.78rem, 0.14–0.2em tracking, uppercase): field labels such as LAST PUSH and DUE, and SAMPLE marks.
- **Stamp** (Big Shoulders 800, uppercase, 0.07em tracking, tabular figures): every stamp, sized to its context (about 1rem on cards, up to 3.4rem on the hero slip).

### Named Rules
**The Typed On The Card Rule.** Anything written on card stock (names, dates, notes, data) is Courier Prime. Public Sans is for prose on the cloth. Big Shoulders is only for stamps and headings.

**The Real Dates Rule.** Stamped dates use tabular figures and come from real data: push dates, due dates, return dates. Illustrative dates are labeled SAMPLE.

## Layout

One centered column up to 72rem wide with 16px gutters (24px from 640px up). Marketing sections breathe at about 96px of vertical padding; the app is denser, with 48px between the borrower's card and the catalog drawer. Catalog cards sit in a grid of one column, two from 640px, and three from 1280px, with 24px horizontal and 32px vertical gaps. Grid tracks use minmax(0, 1fr) so long names and the scrolling tab row never widen the page. On phones the folder tabs scroll horizontally and the hero stacks: headline first, then the slip.

## Elevation & Depth

Depth is paper lying on cloth. Every sheet carries one soft shadow; nothing glows and nothing floats.

### Shadow Vocabulary
- **Paper** (`box-shadow: 0 1px 0 rgb(0 0 0 / 0.06), 0 14px 28px -16px rgb(0 0 0 / 0.55)`): every card-stock surface.
- **Library card button** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.3), 0 12px 24px -14px rgb(0 0 0 / 0.7)`): the primary button at rest; it lifts 1px with a larger shadow on hover and presses 1px on click.
- **Pocket** (`box-shadow: 0 -8px 14px -10px rgb(0 0 0 / 0.45), <paper>`): the kraft pocket casting onto the slip tucked into it.

### Named Rules
**The Paper Depth Rule.** One soft, offset, blurred shadow per sheet. No zero-blur block shadows, no colored halos, no glass.

## Shapes

Nearly square. Card stock has a 3px corner (rounded.card); buttons and inputs on paper have 2px (rounded.slip). Stamps carry a 0.13em border with a 0.16em corner and land rotated a few degrees, never straight. Catalog cards have a drawer-rod hole punched through the bottom center, the book pocket has a semicircular thumb notch, and the notice has tractor-feed holes behind perforations on both edges. Sheets clip their own ink: a stamp can overlap the paper's edge region but never print past it.

## Components

### Buttons
- **Shape:** squared card corners (3px) for the library-card button, 2px for slip buttons.
- **Library card (primary):** manila stock with a 2px ink border, Big Shoulders 700 uppercase at 1.15rem, 3.25rem tall, paper texture, soft shadow. One per view: "Check your record".
- **Slip button:** transparent with a 1.5px ink border, uppercase Big Shoulders at 0.92rem; tints with 9% of its own ink on hover and presses 1px.
- **Slip button, solid:** ink fill with card-colored text, for the primary action on a card ("Return it", "Check out").
- **Quiet action:** typed, underlined text in faded ribbon, for destructive-but-reversible actions such as Withdraw.
- **Focus:** a 2px dashed outline, manila on the cloth and violet on paper, offset 2–3px.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** card stock with a fine paper-tooth noise.
- **Shadow Strategy:** the Paper shadow.
- **Border:** none; sheets are separated by the cloth around them.
- **Internal Padding:** 20–32px, typed content aligned to the ruling where it can be.

### Inputs / Fields
- **Style:** a lightened card-stock fill with a 1.5px faded-ribbon stroke, 2px corners, typed text, violet caret.
- **Focus:** the stroke darkens to ink and a 2px dashed violet outline appears.
- **Error:** errors are typed in bold Overdue Red beneath the field and announced with role="alert".

### Navigation
- **Site and app header:** the round stamp mark and the wordmark in Big Shoulders on the cloth, with plain links. The current page is underlined, not boxed.
- **Folder tabs:** the catalog's drawers (On loan, Shelf, Returned, Withdrawn) are folder tabs on the cloth. The active tab is a card-stock tab joined to a card-colored rule; inactive tabs are faded-foil text. Counts are typed beside each label.

### Catalog Card (signature)
A ruled index card per project: call number (005.133 plus a three-letter cutter) in the left margin, the project name as a typed title linking to GitHub, a floated status stamp, LAST PUSH and DUE as stamped dates, language, stars, forks and open issues, a progress rule with a violet bookmark-ribbon thumb, the weekly roast as a typed italic note, and actions. The due-date stamp is itself the control for changing the date. When a status changes, the new stamp slams in (stamp-in, 360ms, expo-out) with a thunk sound on Return, and the card stays put long enough to read before being re-filed into its new drawer.

### Stamp
The system's only voice for state and its only decorative motion. The only other movement is functional: the riffling card stack while a record is pulled from GitHub, and the spinning sync icon. Big Shoulders caps in one of the four inks, bordered or bare (dates), rotated, multiplied into the paper and roughened by a shared SVG ink filter (edge wobble plus dry-pad speckle). It slams in by scaling from 1.9 to 1 with an expo-out ease; with reduced motion it simply appears.

### Date-Due Slip and Notice
The hero slip is a manila card in a kraft pocket: a DATE DUE header over a red double rule, push dates stamped down a ruled column whose gaps widen until OVERDUE lands across them, and today's date pre-inked in the next empty row. The overdue notice is pink continuous-form paper with tractor-feed holes, typed throughout, used both on the landing page and as the weekly email.

## Do's and Don'ts

### Do:
- **Do** put every readable block on card stock (#f5e9cd) with the Paper shadow; the cloth carries only headings, lead text, and links.
- **Do** show state with a stamp in its own ink, and only that ink.
- **Do** set dates and counts in tabular figures, and mark illustrative content SAMPLE.
- **Do** keep stamps rotated a few degrees and roughened by the shared ink filter.
- **Do** keep small text on paper at 4.5:1 or better in both themes; the dark-mode inks exist for this.

### Don't:
- **Don't** stack small tracked labels (eyebrows or kickers) above headings; let the heading speak.
- **Don't** use zero-blur offset shadows, glows, glass, or gradient text.
- **Don't** put stamp inks on the cloth, or invent a new paper color.
- **Don't** animate entrances, scroll reveals, or hovers beyond a 1px press; only stamps land, and loading states may riffle or spin.
- **Don't** use the retired Kobe Bryant photograph or anyone's likeness.

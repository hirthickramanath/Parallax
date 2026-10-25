# Design system: the observatory notebook

The interface looks like a field notebook from an observatory: bone paper, graphite ink, one brass accent, a serif made for long reading, and a monospace for the labels an instrument would carry. In dark mode it becomes the observatory at night: near-black with amber, the colour of an instrument lamp.

The idea comes from the name. Parallax measures a distance by looking from two places, so the landing page is built around the real parallax diagram and a slider that works, and the course map and lessons borrow the same plain, plate-like layout.

Six stylesheets load in order: `src/index.css` (legacy base), `src/styles/textbook.css` (tokens, colour, type, component appearance), `src/styles/layout.css` (signed-in shell, Today, course map), `src/styles/public.css` (landing and sign-in), `src/styles/lesson.css` (lesson page) and `src/styles/glass.css` (the glass and desktop-window layer, which restyles the others).

## What was avoided on purpose

Research on generic-looking pages (the `taste-skill` notes) lists the usual tells: tiny uppercase letter-spaced labels, pill badges, rows of icon cards, gradients, resting shadows, centred text over a screenshot, and a stock accent colour. This design avoids them:

- Labels are sentence-case monospace, not uppercase tracking.
- No decorative gradients. The one exception is a faint accent glow fixed behind the signed-in shell, which gives the glass something to blur. Shadows are soft and used only on floating or window-like surfaces (dock, cards, switches, lesson nodes).
- The landing page uses ruled lists and one working example instead of feature cards.
- The accent is brass, not blue, indigo, violet or green. It is also not red, because red reads as "wrong answer" in a learning product.

## Why it looks this way

| Choice | Reason | How strong the evidence is |
| --- | --- | --- |
| Light "bone paper" default, dark as an option | Dark text on a light ground is generally easier for long reading in a lit room. Dark helps at night, and amber on near-black is gentle on the eyes. | Moderate. Preference and conditions vary. |
| Literata for reading and headings | Designed for long on-screen reading. Body at about 20px with a 40rem measure (roughly 70 characters). | Moderate for line length, weak for any one typeface. |
| IBM Plex Sans for controls, Plex Mono for ids and figure labels | A clear working face for controls and a monospace that reads as instrument labelling. | Design practice. |
| One accent (brass); ink for the primary action | Fewer competing colours means a clearer main action on each screen. | Design practice. |
| Green and red only for correct and wrong, always with an icon and text | Colour must not be the only signal (about 1 in 12 men are colour-blind), and the accent must never be read as feedback. | Strong for the accessibility rule. |
| Section tint plus label: Explain, Theory, Worked example (cool grey), Practice (brass tint) | A consistent code for content type helps learners find material when revising. One cool tint against warm paper separates worked examples at a glance. | Modest. A navigation aid, not a memory technique. |
| Unit colours by subject (Prussian blue, madder, lichen, graphite, sienna), each with an icon | Colour groups units for wayfinding, and the icon and the written subject name carry the same information for colour-blind learners. | Modest. |

## Layout

| Choice | Reason | How strong the evidence is |
| --- | --- | --- |
| Top navigation instead of a sidebar; phone tab bar | Gives lessons and questions a full-width column; five destinations fit a tab bar without a menu. | Design practice. |
| Today is a numbered sequence: warm-up question, spaced review, then the next lesson | Retrieval before new material is the best-supported ordering (testing effect, spacing). A fixed order removes the decision of where to start. | Strong for retrieval and spacing, modest for the specific order. |
| Course map shows one chapter at a time, as nine tiles with counts | Nine chunks fit in working memory; counts and bars show distance travelled and left (goal gradient). | Modest. |
| Lessons are nodes on a winding path under coloured unit banners; the unit holding the current lesson is open | Keeps the next step visible and makes progress feel physical. A lock, check or star plus a written state (Needs MB1.3, Read, Mastered) means colour is never the only signal. | Design practice for the form, strong for the accessibility rule. |
| Lesson page: contents rail, reading column, simulation | The rail names every section with its type so the learner knows where they are and what comes next; the simulation stays beside the text it belongs to. On phones it collapses to a thin strip. | Design practice. |
| Light/dark switch and colour-theme button sit in the header beside the circular profile button; sign-out stays in the footer | Appearance is changed rarely but should be one tap away and visible on every screen. The switch shows state with position and with sun and moon glyphs. | Design practice. |
| Glass and macOS-style elements: frosted header and phone dock, segmented navigation, switch, push buttons, rounded hairline cards | Familiar desktop controls need no learning. Glass is only used on bars that float over content, with at least 72% opaque page colour behind the text so contrast does not depend on what scrolls underneath. | Design practice; contrast kept by construction. |

Visual style moves retention far less than what the learner is asked to do (retrieving answers, spacing, worked examples). The interface should get out of the way of those, not replace them.

## Tokens

All colours are `--tb-*` custom properties declared as hex values in `textbook.css`, in a light block (`:root`) and a dark block (`:root[data-theme="dark"]`). The legacy variables that `index.css` still reads (`--app-bg`, `--primary-color`, and so on) are aliases of these tokens. Subject colours are `--tb-trk-*` with `--tb-on-track` for text on them.

Appearance is changed with `AppearanceToggles` (a `role="switch"` for dark mode, and a button that steps through the palettes). The stored values are `parallax-theme` (`system`, `light` or `dark`; the switch writes `light` or `dark`) and `parallax-palette`.

Palettes change the accent only. The default is Brass. Cyanotype, Madder, Lichen and Graphite each have a light and a dark accent. To add a palette:

1. Add `:root[data-palette="name"]` and `:root[data-theme="dark"][data-palette="name"]` blocks with `--tb-accent`, `--tb-accent-hover`, `--tb-accent-soft`, `--tb-accent-hsl` and `--tb-gold`.
2. Add the name to the `palettes` list in `scripts/theme-contrast.test.mjs` and in `src/components/ThemeSelect.tsx`.

A stored palette name that is no longer valid falls back to Brass.

## Contrast is tested

`scripts/theme-contrast.test.mjs` (part of `npm test`) reads the tokens and checks every text and control colour pair against WCAG 2.2 AA, in light and dark, for every palette. It requires 4.5:1 for text and 3:1 for control borders, the focus ring and the subject colours against the page. If you add a token that carries text, add its pair to the test. Passing this test does not replace the browser accessibility audit in `tests/a11y.spec.ts`. The dark band on the landing page and sign-in panel uses fixed colours declared in `public.css`; they were checked by hand (text about 13:1, amber about 10:1).

## Fonts

Literata and IBM Plex Sans (variable) and IBM Plex Mono (400 and 500, Latin) are bundled from `@fontsource*` packages, so they are served from the same origin and need no change to the Content Security Policy (`font-src 'self'`). Only the unicode subsets a page uses are downloaded.

## Conventions

- Reading text uses the serif face. Controls, buttons and navigation use the sans face. Ids, figure labels and small captions use the monospace face, in sentence case.
- Do not use a size below 12px.
- Panels (questions, stat strip, chapter tiles, figures) are rounded (12px) with a hairline border and a soft lift. Controls use 7px corners. Glass surfaces declare a solid colour first and add `backdrop-filter` inside `@supports`; `prefers-reduced-transparency` returns them to solid. Window title-bar dots are grey (an inactive window), because red and green mean wrong and correct here.
- The UI font stack starts with the system font (San Francisco on Apple devices) and falls back to the bundled IBM Plex Sans.
- Content-type colours apply to lesson sections through `data-layer` on `.lesson-prose`. Add a layer to the mapping in `textbook.css` and `layerFamily()` in `LessonPlayer.tsx`.
- Respect `prefers-reduced-motion`. The stylesheet turns transitions and animation off for it.
- Remove dead CSS when you remove a component. `index.css` was pruned of rules for classes that no longer appear in the source; check a class is unused (search `src/`, `content/lessons/` and `index.html`) before deleting.

## Not done yet

- `index.css` still contains rules for classes that are in use but are overridden by the newer stylesheets; folding them together is a larger change.
- The landing page has no photography. Real astronomical images (public-domain NASA or ESA material) would suit it, with credits.
- The lesson widgets (simulations) keep their own styling and have not been redesigned.

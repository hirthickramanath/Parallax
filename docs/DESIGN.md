# Design system: the textbook theme

The interface is styled like a well-set textbook: paper, ink, one accent, and a serif reading face. Three stylesheets load in order: `src/index.css` (legacy base), `src/styles/textbook.css` (colour, type and component appearance) and `src/styles/layout.css` (the structure of the signed-in app: shell, Today, course map).

## Why it looks this way

These choices come from what is known about reading and learning, and each has a limit worth stating.

| Choice | Reason | How strong the evidence is |
| --- | --- | --- |
| Light "paper" default, dark as an option | Dark text on a light ground is generally easier for long reading in a lit room. Dark helps at night. | Moderate. Preference and conditions vary. |
| Serif body at about 20px, 40rem measure (roughly 70 characters) | A line length of 50 to 75 characters and generous line spacing reduce reading effort. | Moderate for line length, weak for serif versus sans. |
| One accent, ink for the primary action | Fewer competing colours means a clearer main action on each screen. | Design practice, not a measured learning effect. |
| Green and red only for correct and wrong, always with an icon and text | Colour must not be the only signal (about 1 in 12 men are colour-blind), and the accent must never be read as feedback. | Strong for the accessibility rule. |
| Section tint plus label: Explain, Theory, Worked example, Practice | A consistent code for content type helps learners find material when revising. | Modest. Treat it as a navigation aid, not a memory technique. |
| Lesson steps strip, coloured by content type | Shows where the learner is and what kind of section comes next. | Design practice. |

## Layout

| Choice | Reason | How strong the evidence is |
| --- | --- | --- |
| Top navigation instead of a sidebar; phone tab bar | Gives the lesson and question a full-width column; five destinations fit a tab bar without a menu. | Design practice. |
| Today is a numbered sequence: warm-up question, spaced review, then the next lesson | Retrieval before new material is the best-supported ordering (testing effect, spacing). A fixed order also removes the decision of where to start. | Strong for retrieval and spacing, modest for the specific order. |
| Course map shows one chapter at a time, as nine tiles with counts | Nine chunks fit in working memory; counts and bars show distance travelled and distance left (goal gradient). The previous map was a single list of up to 60 circles. | Modest. |
| Units collapse, and the unit holding the current lesson is open | Keeps the next step visible without scrolling past finished work. | Design practice. |
| Every lesson state has a glyph and a word (Mastered, Read, Needs X, Continue here) | Colour is never the only signal. Reading and mastery stay separate, as in the data model. | Strong for the accessibility rule. |
| Appearance and sign-out live in the footer | Rarely used controls stay out of the working area. | Design practice. |

Visual style moves retention far less than what the learner is asked to do (retrieving answers, spacing, worked examples). The interface should get out of the way of those, not replace them.

## Tokens

All colours are `--tb-*` custom properties declared as hex values in `textbook.css`, in a light block (`:root`) and a dark block (`:root[data-theme="dark"]`). The legacy variables that `index.css` still reads (`--app-bg`, `--primary-color`, and so on) are aliases of these tokens.

Palettes change the accent only. The default is "Ink blue". Forest, Cosmic violet, Ocean blue and Ember each have a light and a dark accent. To add a palette:

1. Add `:root[data-palette="name"]` and `:root[data-theme="dark"][data-palette="name"]` blocks with `--tb-accent`, `--tb-accent-hover`, `--tb-accent-soft` and `--tb-accent-hsl`.
2. Add the name to the `palettes` list in `scripts/theme-contrast.test.mjs`.
3. Add an `<option>` in `src/components/ThemeSelect.tsx`.

## Contrast is tested

`scripts/theme-contrast.test.mjs` (part of `npm test`) reads the tokens and checks every text and control colour pair against WCAG 2.2 AA, in light and dark, for every palette. It requires 4.5:1 for text and 3:1 for control borders and the focus ring. If you add a token that carries text, add its pair to the test. Passing this test does not replace the browser accessibility audit in `tests/a11y.spec.ts`.

## Fonts

Newsreader (reading and headings) and Inter Tight (controls and labels) are bundled from `@fontsource-variable/*`, so they are served from the same origin and need no change to the Content Security Policy (`font-src 'self'`). Only the unicode subsets a page uses are downloaded.

## Conventions

- Reading text uses the serif face. Labels, buttons and navigation use the sans face.
- Do not use a size below 12px. The base stylesheet was raised to meet this; keep new rules at or above it.
- Sections open with a double rule. Panels (questions, figures, the tutor) are flat, with a 1px rule border and square corners.
- Content-type colours apply to lesson sections through `data-layer` on `.lesson-prose`. Add a layer to the mapping in `textbook.css` and `layerFamily()` in `LessonPlayer.tsx`.
- Respect `prefers-reduced-motion`. The stylesheet turns transitions off for it.

## Not done yet

- `index.css` still contains superseded colour, shape and layout rules (the old sidebar, level path and phase tabs) that are no longer used or are overridden. They can be removed in a clean-up pass.
- The lesson page layout is unchanged apart from the steps strip and section tints.
- The public home page and sign-in page take the new tokens but have had less layout work than the signed-in screens.

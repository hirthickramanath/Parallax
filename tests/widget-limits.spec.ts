import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { signedIn } from "./helpers";

// Control-contract sweep for the embedded simulations.
//
// For every lesson with sliders this drives each slider to its minimum, maximum and middle with the
// keyboard, types an out-of-range value, and checks that:
//   - the page raises no runtime error,
//   - no new "NaN", "Infinity", "undefined" or "[object" text appears in the lesson,
//   - a typed value beyond the range is clamped to the range,
// It also records whether moving a slider from minimum to maximum changed anything BEYOND the slider's
// own value label (drawing markup, a computed <output> readout, or at least two lines of text). Some
// experiments only reveal their sliders after the learner picks a conjecture, so the sweep picks the first
// option of such a prediction fieldset when no slider is visible yet. A readout that changes shows the
// control is wired to something; it does not show that the claimed quantity is calculated.
//
// This catches broken controls and numerical blow-ups at the ends of a range. It does NOT show that a
// model is scientifically right, and a changing readout does not prove the claimed quantity is
// calculated: that needs a reviewer to read the model code. Results go to test-results/widget-limits.json.
//
// The full sweep is slow (one page per lesson), so it is opt-in:  WIDGET_SWEEP=1 npm run test:widgets
const sweep = process.env.WIDGET_SWEEP === "1";
const sample = ["PB1.4", "PB2.2", "AS1.3", "AS3.6", "MA4.2", "CB1.3"];
const lessonIds = readdirSync("content/lessons")
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.slice(0, -4))
  .sort();
const only = (process.env.WIDGET_LESSONS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const chosen = only.length
  ? only.filter((id) => lessonIds.includes(id))
  : sweep
    ? lessonIds
    : sample.filter((id) => lessonIds.includes(id));
const BAD = /NaN|Infinity|undefined|\[object/g;
const count = (text: string) => (text.match(BAD) ?? []).length;

// Controls that are meant to leave the plotted quantity unchanged. Each needs a reason a reader can check.
const unchangedByDesign: Record<string, string> = {
  "MA6.6/Positive radius (changes Re log only)":
    "The plotted quantity is Im log(r e^{it}) = t, which does not depend on r; the radius only changes Re log = ln r.",
};

type Finding = {
  lesson: string;
  sliders: number;
  reactive: number;
  unchangedByDesign: string[];
  problems: string[];
};
const findings: Finding[] = [];

async function openInteractive(page: Page, id: string) {
  await page.goto(`/lesson/${id}`);
  await page.getByLabel("Lesson section").selectOption("puzzle");
  await page
    .getByLabel("Your prediction", { exact: true })
    .fill("I will test the assumptions before accepting the result.");
  await page.getByRole("button", { name: "Commit and investigate" }).click();
  await page.getByLabel("Lesson section").selectOption("interactive");
  await expect(page.locator(".lesson-prose").first()).toBeVisible();
}

test.describe(
  sweep ? "widget control sweep (all lessons)" : "widget control sample",
  () => {
    test.describe.configure({ timeout: sweep ? 20 * 60_000 : 120_000 });

    test("sliders accept keyboard and typed input without breaking", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await signedIn(page);
      for (const id of chosen) {
        const problems: string[] = [];
        let reactive = 0;
        let sliders = 0;
        const designed: string[] = [];
        await test.step(id, async () => {
          await openInteractive(page, id);
          const prose = page.locator("main").first();
          const range = page.locator('.simulation-slider input[type="range"]');
          const prediction = page.locator(
            'fieldset.prediction input[type="radio"]',
          );
          if ((await range.count()) === 0 && (await prediction.count()) > 0)
            await prediction.first().check();
          const baseline = count(await prose.innerText());
          const readouts = () =>
            prose
              .locator("output")
              .evaluateAll((n) => n.map((e) => e.textContent ?? "").join("|"));
          sliders = await range.count();
          for (let i = 0; i < sliders; i++) {
            const slider = range.nth(i);
            const label =
              (await slider.getAttribute("aria-label")) ?? `slider ${i + 1}`;
            const start = await slider.inputValue();
            await slider.focus();
            await slider.press("Home");
            const low = await slider.inputValue();
            const textLow = (await prose.innerText()).split("\n");
            const outLow = await readouts();
            const svgLow = await prose
              .locator("svg")
              .evaluateAll((n) => n.map((e) => e.innerHTML).join("|"));
            await slider.press("End");
            const high = await slider.inputValue();
            const textHigh = (await prose.innerText()).split("\n");
            const outHigh = await readouts();
            const svgHigh = await prose
              .locator("svg")
              .evaluateAll((n) => n.map((e) => e.innerHTML).join("|"));
            // A third sample inside the range: a response that is symmetric about the middle (for example
            // a quantity that depends on the square of the control) gives the same readout at both ends.
            for (let k = 0; k < 5; k++) await slider.press("PageDown");
            const outMid = await readouts();
            const svgMid = await prose
              .locator("svg")
              .evaluateAll((n) => n.map((e) => e.innerHTML).join("|"));
            const changedLines = textHigh.filter(
              (line, k) => line !== textLow[k],
            ).length;
            if (Number(low) > Number(high))
              problems.push(
                `${label}: Home value ${low} exceeds End value ${high}`,
              );
            if (
              svgLow !== svgHigh ||
              svgMid !== svgHigh ||
              outLow !== outHigh ||
              outMid !== outHigh ||
              changedLines >= 2 ||
              textHigh.length !== textLow.length
            )
              reactive += 1;
            else if (unchangedByDesign[`${id}/${label}`])
              designed.push(`${label}: ${unchangedByDesign[`${id}/${label}`]}`);
            const text = await prose.innerText();
            if (count(text) > baseline)
              problems.push(
                `${label}: NaN/Infinity/undefined text at an end of its range`,
              );
            // Typed value far beyond the range must clamp to the maximum.
            const entry = slider.locator(
              "xpath=ancestor::div[contains(@class,'simulation-slider')][1]",
            );
            await entry.locator("summary").click();
            const number = entry.locator('input[type="number"]');
            await number.fill("1e99");
            await number.press("Enter");
            const clamped = await slider.inputValue();
            if (Number(clamped) !== Number(high))
              problems.push(
                `${label}: typed 1e99 gave ${clamped}, expected the maximum ${high}`,
              );
            await slider.press("Home");
            await slider.press("ArrowRight");
            const mid = await slider.inputValue();
            if (Number(mid) < Number(low))
              problems.push(`${label}: ArrowRight moved below the minimum`);
            // Put it back for the next control.
            await number.fill(start);
            await number.press("Enter");
          }
          if (count(await prose.innerText()) > baseline)
            problems.push(
              "NaN/Infinity/undefined text remained after the sweep",
            );
        });
        findings.push({
          lesson: id,
          sliders,
          reactive,
          unchangedByDesign: designed,
          problems,
        });
      }
      mkdirSync("test-results", { recursive: true });
      writeFileSync(
        "test-results/widget-limits.json",
        JSON.stringify(
          {
            note: "Control-contract sweep. Reactive = drawing markup, a computed readout (<output>) or at least two lines of text changed between the minimum and maximum of a slider (the slider's own value label alone does not count). Not scientific validation.",
            sweep,
            lessons: findings.length,
            withSliders: findings.filter((f) => f.sliders > 0).length,
            withProblems: findings.filter((f) => f.problems.length > 0).length,
            withoutAnyReactiveSlider: findings
              .filter(
                (f) =>
                  f.sliders > 0 &&
                  f.reactive + f.unchangedByDesign.length === 0,
              )
              .map((f) => f.lesson),
            findings: findings.filter(
              (f) =>
                f.problems.length > 0 ||
                f.sliders === 0 ||
                f.reactive + f.unchangedByDesign.length < f.sliders,
            ),
          },
          null,
          2,
        ),
      );
      expect(errors).toEqual([]);
      expect(
        findings.flatMap((f) => f.problems.map((p) => `${f.lesson}: ${p}`)),
      ).toEqual([]);
    });
  },
);

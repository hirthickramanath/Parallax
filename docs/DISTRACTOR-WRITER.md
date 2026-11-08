# Independent distractor writing: how to run it

Goal: measure how far the shipped wrong options differ from what a different author would write, and find the
questions where the AI-written options are arguably correct or too easy. See `docs/QUESTION-QUALITY.md` for why.

## For the writer

You need a person who knows the subject and has **not** read the lessons' multiple-choice options. Do not look at the
lessons while filling the sheet.

1. Open `content/review/distractor-packet.csv` (149 questions from 30 lessons, every 12th lesson). Each row has the
   question and its correct answer.
2. For each row, write three wrong answers a student who half understands the topic might pick. Each should be
   something you could argue for, not an obvious filler. Roughly match the correct answer's length and style.
3. Put anything unusual in `flag` (for example "the correct answer is arguably incomplete" or "my distractor 2 is
   also true under some reading").
4. Save as a new file and do not edit the original.

## For the maintainer

```
node scripts/distractor-packet.mjs export out.csv [LESSON_ID ...]   # regenerate or pick other lessons
node scripts/distractor-packet.mjs compare responses.csv
```

`compare` reports, over the rows that are complete:

- where the correct answer ranks by length with the writer's options and with the shipped ones (0 = longest);
- the average word overlap between each human distractor and its closest shipped distractor (low means the writer
  found different misconceptions);
- the writer's flags.

How to read it: if the human key-length ranks are near 25% each and the shipped ones are not, the shipped set still
leaks length. If overlap is high everywhere, the AI options already cover the plausible misconceptions. Flagged rows
are the first to fix. Nothing here changes a lesson or its review status; replacing options is a separate, reviewed
edit, and a lesson that changes needs a new reviewer record.

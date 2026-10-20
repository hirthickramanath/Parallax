# Voluntary learner pilot

Open Settings → Open learner pilot, or `/learner-pilot`, while signed in.
Participation is optional and has no effect on progress, XP or access. This is a
small descriptive study of fluids, thermodynamics, conics and planes, not a
calibrated examination or proof of course effectiveness.

1. Choose to participate and give prior knowledge. Complete the baseline before
   the linked revision lessons. A blank numeric answer is preserved as unknown,
   not scored as zero. Explain your reasoning in your own words.
2. Study the four linked Parallax revision chapters. Return for the immediate
   check and record where you studied, any help or prior question exposure, and
   what felt confusing or too easy/hard. Previously seeing these questions in
   chat counts as exposure; it must not be presented as a clean baseline.
3. Return at least six days after the immediate check for the delayed form.
   Record intervening help and revision. Each submitted stage stays unchanged.
4. Export pilot answers if you choose to share them for analysis. The JSON is
   accepted by `node scripts/pilot-report.mjs PATH_TO_EXPORTED_JSON`. Keep actual
   participant exports outside the repository. The browser does not upload them.

The local record is separated by signed-in account on that browser. It contains
a random study code, consent date, answers, reasoning and study/assistance notes,
without adding account name, email or Firebase UID to the export. Free text may
still contain identifying information if a learner types it: avoid doing so.
It is not synced between devices and can be erased in the pilot page. Browser
storage is editable by its owner; it is not independently authenticated evidence.

The report can prepare descriptive numeric scores; human reasoning scores must
be supplied by real reviewers. No participant, response, score, improvement or
independent approval has been manufactured by adding this interface. The user's
previous chat feedback alone is not a scored Parallax lesson trial.

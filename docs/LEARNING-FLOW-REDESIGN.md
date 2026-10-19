# Learning flow changes — 19 October 2026

## Implemented

- Settings offers a two-step restart from the beginning or a chosen lesson and section. It resets lesson completion/mastery/bookmarks, affected unit skip credits and existing recall schedules from that curriculum point onward. Notes, previous attempts, historical XP and streaks remain. Existing activity identifiers prevent repeat lesson/check XP after a restart.
- Reset markers participate in lesson, unit and review-card merge rules. An older offline device cannot restore pre-reset mastery or skip credit merely by submitting an older generation with a later ordinary timestamp. This uses existing collections; no profile schema or admin operation is required.
- The dashboard contains an automatic Monday-based weekly plan in the learner's timezone. Opening the dashboard in a new week generates eligible work; no separate plan-generation action is needed. A restart invalidates the current plan so it can rebuild. Generation happens when the app is open, not through a background server job.
- A chapter-selectable level path shows lesson states and prerequisite recommendations. The problem of the day sits in a separate right column on desktop and moves above the main content on narrow screens.
- Appearance controls are available in the signed-in header: system/light/dark and Forest, Cosmic violet, Ocean blue or Ember accents. Appearance also initializes on direct focused-lesson reloads.
- Lesson routes omit sidebar, activity header, mobile navigation, footer and study-reminder interruptions. Exit and lesson controls remain available.
- Separate lab navigation and the dashboard lab tile are removed. The former lab URL returns to the dashboard. Existing apparatus now appears alongside its connected lesson, with a stacked layout on mobile. Project links open connected lessons.
- Two new directly manipulable explorations cover vectors and Schwarzschild light trajectories. Vector tips support dragging and arrow keys; the photon launch handle and impact slider change the integrated ray. Both retain assumptions and model limitations. Existing apparatus keeps its domain-specific controls and reading tables.
- Due retrieval cards appear inside the lesson flow, capped at two per interlude and respecting the new-card limit. Reveals and self-ratings update the existing FSRS records; standalone Review/Revise navigation is removed. Legacy direct routes remain available for saved links.
- A four-question adaptive readiness sequence selects unused warm-up/check/Core questions, moves up after correct first attempts and down after errors, and remembers a provisional starting level per track. Practice ordering and support text respond to it. Complete theory and every authored exercise remain accessible; assessment does not award prerequisite credit.

## Practical limits

This is an adaptive sequence over the current authored bank, not a calibrated psychometric assessment. The existing questions still need more depth and independent scientific review. Difficulty labels alone do not make every lesson appropriately challenging for every learner.

Simulations are embedded for lessons with existing authored widgets plus the new vector and black-hole topic matches. This is not a claim that all 354 lessons have a bespoke simulation. More topic-specific models and richer direct manipulation of older apparatus remain content work.

Firebase merge behavior is verified locally. Real-account, cross-device production sync and production rules publication still require live verification. These changes do not activate a tutor provider or deploy production.

## Validation

Production build/content validation passed for 354 drafts. All 91 model/grading/example tests passed, including reset-epoch merge precedence, adaptive selection/week boundaries and captured/scattered photon trajectories. The full 87-case browser suite passed, covering every lesson's full-theory rendering and the retained account/offline workflows. After the final map-selection alignment, the build and model tests passed again and all five new feature cases were rerun successfully, including the case where bridge maths is complete but bridge physics remains.

Restart coverage includes selecting a Full-only theory section while the saved preference is Quick, preserving notes and historical XP, retaining earlier completion and preventing duplicate completion XP. New inline recall coverage rates two cards in the next lesson and verifies the review log. Mocked authentication/cloud requests do not establish live production synchronization or deployed rules.

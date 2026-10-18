import fs from "node:fs";
import { parse } from "yaml";
const c = JSON.parse(fs.readFileSync("content/curriculum.json", "utf8"));
const authored = new Map(
  fs
    .readdirSync("content/lessons")
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(`content/lessons/${file}`, "utf8");
      const header = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
      if (!header) throw Error(`Missing header: ${file}`);
      const lesson = parse(header[1]);
      return [lesson.id, lesson];
    }),
);
const remaining = c.lessons.filter((l) => !authored.has(l.id));
const cards = [...authored.values()].reduce((n, l) => n + l.review.length, 0);
let report = `# Course completion ledger\n\nGenerated from the curriculum and authored MDX with \`npm run content:report\`. This counts content, not scientific certification.\n\n- Curriculum: **${c.lessons.length} entries in ${c.units.length} units**.\n- Playable authored drafts: **${authored.size}**.\n- Authored recall cards: **${cards}**.\n- Missing lesson bodies: **${remaining.length}**.\n- Independently verified/published lessons: **${[...authored.values()].filter((l) => ["verified", "published"].includes(l.status)).length}**.\n\nAll lesson drafts require source and scientific review. A filled foundation unit does not imply textbook-level depth across every advanced subtopic.\n\n## Unit coverage\n\n| Phase | Unit | Subject | Authored / planned | Missing IDs |\n| --- | --- | --- | --- | --- |\n`;
for (const u of c.units) {
  const missing = u.lessons.filter((id) => !authored.has(id));
  report += `| ${u.phase} | ${u.id} | ${u.title} | ${u.lessons.length - missing.length} / ${u.lessons.length} | ${missing.join(", ") || "None"} |\n`;
}
report +=
  "\n## Remaining execution sequence\n\n1. Finish the earliest unlocked mathematics, mechanics and scientific-computing units before relying on their later applications.\n2. Author every missing ID above as original MDX, preserving IDs and prerequisite graph. Include assumptions, derivations, limitations, worked examples, conceptual checks, exercises and genuine recall prompts.\n3. Add apparatus or data investigations where educationally relevant. Keep computed, synthetic and externally measured data explicitly distinct; record dataset provenance before claiming real observations.\n4. Verify exact source editions/sections and independently review science before changing draft status.\n5. Run content validation, the production build, model tests and the authored-lesson browser sweep. Update this ledger and push reviewed changes.\n6. Complete owner-session Firebase rules and cross-device checks, then configure an eligible tutor provider. Background push and new cloud profile paths remain separate unresolved designs.\n";
fs.writeFileSync("docs/COURSE-STATUS.md", report);
console.log(
  `${authored.size} authored / ${c.lessons.length}; ${remaining.length} missing; ${cards} recall cards`,
);

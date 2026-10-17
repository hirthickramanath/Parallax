import katex from "katex";
import "katex/dist/katex.min.css";
export function MathText({
  children,
  display = false,
}: {
  children: string;
  display?: boolean;
}) {
  // Only static authored TeX is supplied here; KaTeX's trusted HTML features stay disabled.
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    output: "htmlAndMathml",
  });
  return (
    <span
      className={display ? "math-display" : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Catch accidentally executable prose such as e^{kt}; authored TeX belongs in $...$. */
export function remarkSafeContent() {
  return (tree: unknown) => {
    function visit(value: unknown) {
      if (!value || typeof value !== "object") return;
      const node = value as {
        type?: string;
        value?: string;
        children?: unknown[];
      };
      if (
        node.type === "mdxTextExpression" ||
        node.type === "mdxFlowExpression"
      ) {
        if (!/^\s*\/\*[\s\S]*\*\/\s*$/.test(node.value || ""))
          throw Error(
            "Raw MDX expression in lesson prose. Put TeX inside $...$ or $$...$$; only MDX comments are permitted.",
          );
      }
      if (node.type === "mdxjsEsm")
        throw Error(
          "Lessons use registered components, not embedded import/export code.",
        );
      for (const child of node.children || []) visit(child);
    }
    visit(tree);
  };
}

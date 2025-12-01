type PageTemplateInput = {
  label: string;
  sidebar?: string;
  body: string;
};

export function renderPageWithFrontmatter(input: PageTemplateInput) {
  const frontmatterLines = [
    `title: ${input.label}`,
    ...(input.sidebar ? [`sidebar: ${input.sidebar}`] : []),
  ];

  return [
    "---",
    ...frontmatterLines,
    "---",
    input.body.trim(),
    "",
  ].join("\n");
}

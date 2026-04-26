export type TemplateId = "classic" | "modern" | "minimal";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
  /** Free users can only select templates where `pro` is false. */
  pro: boolean;
  /** Primary accent color used by the template (hex). */
  accent: string;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean and professional. Works for every business.",
    pro: false,
    accent: "#4f46e5",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Gradient header, bold totals, great for creatives.",
    pro: true,
    accent: "#0ea5e9",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Monochrome, typography-forward. Editorial feel.",
    pro: true,
    accent: "#111827",
  },
];

const TEMPLATES_BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: string | null | undefined): TemplateMeta {
  return TEMPLATES_BY_ID.get((id ?? "classic") as TemplateId) ?? TEMPLATES[0];
}

export function isProTemplate(id: string | null | undefined): boolean {
  return getTemplate(id).pro;
}

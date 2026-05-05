export type TemplateId = "vivid" | "dark" | "nature" | "sunset";

export interface TemplateTheme {
  root: string;
  hero: string;
  heroText: string;
  heroSubtext: string;
  heroBg: string;
  sectionBg: string;
  cardBg: string;
  border: string;
  buttonBg: string;
  buttonText: string;
  footerBg: string;
  accent: string;
}

const themes: Record<string, TemplateTheme> = {
  vivid: {
    root: "bg-[#f5f3ff] text-[#1a0a3d]",
    hero: "bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700",
    heroText: "text-white",
    heroSubtext: "text-white/80",
    heroBg: "",
    sectionBg: "bg-white",
    cardBg: "bg-white border border-violet-100",
    border: "border-violet-200",
    buttonBg: "bg-white text-violet-700 hover:bg-violet-50",
    buttonText: "text-violet-700",
    footerBg: "bg-[#f5f3ff]",
    accent: "text-violet-600",
  },
  dark: {
    root: "bg-zinc-950 text-zinc-100",
    hero: "bg-gradient-to-br from-zinc-900 to-zinc-800",
    heroText: "text-white",
    heroSubtext: "text-zinc-400",
    heroBg: "",
    sectionBg: "bg-zinc-900",
    cardBg: "bg-zinc-800 border border-zinc-700",
    border: "border-zinc-700",
    buttonBg: "bg-zinc-100 text-zinc-900 hover:bg-white",
    buttonText: "text-zinc-100",
    footerBg: "bg-zinc-900",
    accent: "text-zinc-300",
  },
  nature: {
    root: "bg-[#f0fdf4] text-[#052e16]",
    hero: "bg-gradient-to-br from-emerald-500 to-teal-600",
    heroText: "text-white",
    heroSubtext: "text-white/80",
    heroBg: "",
    sectionBg: "bg-white",
    cardBg: "bg-white border border-emerald-100",
    border: "border-emerald-200",
    buttonBg: "bg-white text-emerald-700 hover:bg-emerald-50",
    buttonText: "text-emerald-700",
    footerBg: "bg-[#f0fdf4]",
    accent: "text-emerald-600",
  },
  sunset: {
    root: "bg-[#fff7ed] text-[#3d0f00]",
    hero: "bg-gradient-to-br from-orange-500 to-rose-500",
    heroText: "text-white",
    heroSubtext: "text-white/80",
    heroBg: "",
    sectionBg: "bg-white",
    cardBg: "bg-white border border-orange-100",
    border: "border-orange-200",
    buttonBg: "bg-white text-orange-600 hover:bg-orange-50",
    buttonText: "text-orange-600",
    footerBg: "bg-[#fff7ed]",
    accent: "text-orange-500",
  },
};

export function getTheme(id: string): TemplateTheme {
  return themes[id] ?? themes.vivid;
}

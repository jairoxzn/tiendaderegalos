import {
  Gift,
  Flower2,
  CircleDot,
  Candy,
  Coffee,
  Sparkles,
  Mail,
  PartyPopper,
  Heart,
  GraduationCap,
  TreePine,
  Palette,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

const ICONS_BY_KEYWORD: [string, LucideIcon][] = [
  ["peluche", Gift],
  ["flor", Flower2],
  ["globo", CircleDot],
  ["chocolate", Candy],
  ["taza", Coffee],
  ["accesorio", Sparkles],
  ["tarjeta", Mail],
  ["caja", Gift],
  ["cumplea", PartyPopper],
  ["valent", Heart],
  ["madre", Flower2],
  ["padre", Gift],
  ["graduaci", GraduationCap],
  ["navidad", TreePine],
  ["personalizado", Palette],
  ["regalo", Gift],
];

export function getCategoryIcon(categoryName: string): LucideIcon {
  const normalized = categoryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  for (const [keyword, icon] of ICONS_BY_KEYWORD) {
    if (normalized.includes(keyword)) return icon;
  }
  return MoreHorizontal;
}

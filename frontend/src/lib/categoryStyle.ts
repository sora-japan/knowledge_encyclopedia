import { Category } from "@/lib/types";

/**
 * カテゴリごとの配色。
 * Tailwind は静的なクラス文字列しか拾えないため、
 * 動的に組み立てず完全なクラス名をそのまま持たせる。
 */
type CategoryStyle = {
  /** カード上部のカテゴリバッジ */
  badge: string;
  /** カード下部のタグチップ */
  tag: string;
};

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  プログラミング: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    tag: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  },
  "データ・AI": {
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    tag: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
  },
  "インフラ・ツール": {
    badge:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    tag: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  ビジネス: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    tag: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  },
  "健康・生活": {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    tag: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  "言語・人文": {
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    tag: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  },
  科学: {
    badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    tag: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300",
  },
  その他: {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    tag: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
  },
};

/** 未知のカテゴリが来ても落ちないようにフォールバックする */
export function categoryStyle(category: Category): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES["その他"];
}

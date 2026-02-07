import type { OptionStyle, Question, TextBoxHeight } from "@/types/exam";

export function createId() {
  return `q_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export const optionStyles: OptionStyle[] = [
  "number",
  "alphabet",
  "kana",
  "iroha",
];
export const textHeights: TextBoxHeight[] = ["small", "medium", "large"];

export function getOptionLabel(style: OptionStyle, index: number): string {
  switch (style) {
    case "number":
      return String(index + 1);
    case "alphabet":
      return String.fromCharCode(97 + index);
    case "kana": {
      const list = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ"];
      return list[index] ?? `k${index + 1}`;
    }
    case "iroha": {
      const list = ["イ", "ロ", "ハ", "ニ", "ホ", "ヘ", "ト", "チ", "リ", "ヌ"];
      return list[index] ?? `i${index + 1}`;
    }
    default:
      return String(index + 1);
  }
}

export function normalizeQuestion(q: Question, index: number): Question {
  if (q.type === "mark") {
    const optionsCount = Math.max(2, q.optionsCount ?? 4);
    const optionStyle = optionStyles.includes(
      (q.optionStyle ?? "alphabet") as OptionStyle,
    )
      ? (q.optionStyle as OptionStyle)
      : "alphabet";

    // Migrate old correctOption to correctOptions if needed (though TS might complain if we don't cast)
    // The type definition expects correctOptions.
    // If we are normalizing an old object that might still have correctOption (at runtime), we should handle it.
    let correctOptions: number[] = [];

    // @ts-ignore: handling migration
    if (typeof q.correctOption === 'number') {
       // @ts-ignore
       correctOptions = [q.correctOption];
    } else if (Array.isArray(q.correctOptions)) {
       correctOptions = q.correctOptions;
    }

    // Filter valid indices
    correctOptions = correctOptions
       .filter((idx) => typeof idx === 'number' && idx >= 0 && idx < optionsCount)
       // sort and unique
       .sort((a, b) => a - b)
       .filter((val, i, arr) => arr.indexOf(val) === i);

    return {
      ...q,
      id: q.id || createId(),
      label: q.label || `Q${index + 1}`,
      points: Number.isFinite(q.points) ? q.points : 0,
      type: "mark",
      optionsCount,
      optionStyle,
      correctOptions,
      // Remove legacy field if it exists in the object spread
      // @ts-ignore
      correctOption: undefined,
    };
  }

  return {
    ...q,
    id: q.id || createId(),
    label: q.label || `Q${index + 1}`,
    points: Number.isFinite(q.points) ? q.points : 0,
    type: "text",
    boxHeight: textHeights.includes((q.boxHeight ?? "medium") as TextBoxHeight)
      ? (q.boxHeight as TextBoxHeight)
      : "medium",
  };
}

import { printToFileAsync } from "expo-print";
import type { ExamConfig, OptionStyle } from "@/types/exam";
import { getOptionLabel } from "./exam-utils";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPrintableHtml(config: ExamConfig): string {
  const rows = config.questions
    .map((q) => {
      const label = escapeHtml(q.label);
      const points = Number.isFinite(q.points) ? q.points : 0;

      if (q.type === "mark") {
        const optionsCount = Math.max(2, q.optionsCount ?? 4);
        const optionStyle = (q.optionStyle ?? "alphabet") as OptionStyle;
        const bubbles = Array.from({ length: optionsCount })
          .map((_, idx) => {
            const text = escapeHtml(getOptionLabel(optionStyle, idx));
            return `<span class="bubble-wrap"><span class="bubble-label">${text}.</span><span class="bubble"></span></span>`;
          })
          .join("");

        return `<div class="row"><div class="q-label">${label}</div><div class="q-body mark">${bubbles}</div><div class="q-points">(${points})</div></div>`;
      }

      const boxClass =
        q.boxHeight === "large" ? "lg" : q.boxHeight === "small" ? "sm" : "md";
      return `<div class="row"><div class="q-label">${label}</div><div class="q-body"><div class="text-box ${boxClass}"></div></div><div class="q-points">(${points})</div></div>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      margin: 20mm; 
      color: #1e293b;
      font-size: 11pt;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end; 
      border-bottom: 2px solid #1e293b; 
      padding-bottom: 12px; 
      margin-bottom: 20px; 
    }
    .title { 
      font-size: 22pt; 
      font-weight: 700; 
      color: #0f172a;
    }
    .name-box { 
      width: 200px; 
      height: 40px; 
      border: 1.5px solid #334155; 
      border-radius: 6px;
      font-size: 9pt; 
      padding: 4px 8px; 
      color: #64748b;
    }
    .row { 
      display: flex; 
      align-items: flex-start; 
      gap: 12px; 
      margin: 12px 0; 
      page-break-inside: avoid; 
    }
    .q-label { 
      width: 50px; 
      text-align: right; 
      font-weight: 700; 
      padding-top: 4px;
      color: #334155;
    }
    .q-body { 
      flex: 1; 
    }
    .q-points { 
      width: 45px; 
      font-size: 10pt; 
      text-align: right; 
      padding-top: 4px;
      color: #64748b;
    }
    .mark { 
      min-height: 28px; 
      display: flex; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 14px;
      padding: 4px 0;
    }
    .bubble-wrap { 
      display: inline-flex; 
      align-items: center; 
      gap: 3px; 
    }
    .bubble-label { 
      font-size: 10pt;
      font-weight: 500;
      color: #475569;
    }
    .bubble { 
      width: 22px; 
      height: 14px; 
      border: 1.5px solid #334155; 
      border-radius: 999px; 
      display: inline-block;
      background: #fff;
    }
    .text-box { 
      border-bottom: 1.5px dashed #94a3b8; 
      background: linear-gradient(to bottom, transparent 95%, #f1f5f9 100%);
    }
    .text-box.sm { height: 32px; }
    .text-box.md { height: 80px; }
    .text-box.lg { height: 130px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${escapeHtml(config.title)}</h1>
    <div class="name-box">Name / Student ID</div>
  </div>
  ${rows}
</body>
</html>`;
}

export async function generateExamPdf(config: ExamConfig): Promise<string> {
  const html = buildPrintableHtml(config);
  const result = await printToFileAsync({ html });
  return result.uri;
}

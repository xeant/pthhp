"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Check, Clipboard, Copy, Download, PieChart } from "lucide-react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables, ChartDataLabels, {
  id: "whiteCanvasBackground",
  beforeDraw(chart, _args, options) {
    const context = chart.ctx;
    context.save();
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = (options as { color?: string }).color || "#ffffff";
    context.fillRect(0, 0, chart.width, chart.height);
    context.restore();
  },
});

const DEFAULT_DATA = `{
  "labels": ["설문 결과"],
  "datasets": [
    { "label": "매우 찬성 (66%)", "data": [726], "backgroundColor": "#4472c4" },
    { "label": "찬성 (16%)", "data": [180], "backgroundColor": "#8faadc" },
    { "label": "중립 (5%)", "data": [52], "backgroundColor": "#a5a5a5" },
    { "label": "반대 (5%)", "data": [60], "backgroundColor": "#f4b183" },
    { "label": "매우 반대 (7%)", "data": [76], "backgroundColor": "#ed7d31" }
  ]
}`;

const DEFAULT_OPTIONS = `{
  "indexAxis": "y",
  "responsive": true,
  "maintainAspectRatio": false,
  "scales": {
    "x": { "stacked": true, "display": false },
    "y": { "stacked": true, "display": false }
  },
  "plugins": {
    "legend": { "position": "top" },
    "datalabels": { "color": "white", "font": { "weight": "bold", "size": 14 } },
    "whiteCanvasBackground": { "color": "#ffffff" }
  }
}`;

const DEFAULT_CSS = `#tool-chart-canvas-wrap {
  height: 180px;
  padding: 20px;
  background-color: #ffffff;
}`;

const AI_PROMPT = `아래 데이터를 바탕으로 Chart.js 가로 누적 막대그래프의 데이터, 옵션, CSS를 작성해 주세요.

1. 데이터(JSON): 긍정/부정/중립 항목을 구분하고, 각 계열 이름에는 항목명과 비율(%)을 함께 표기해 주세요.
2. 옵션(JSON): indexAxis는 "y", 각 축은 stacked: true로 설정하고, 막대 내부에 흰색 굵은 글씨로 값이 보이도록 datalabels 설정을 포함해 주세요.
3. CSS: 범례가 위면 높이 120px, 아래면 높이 180px에 맞춰 #tool-chart-canvas-wrap을 설정해 주세요.`;

type ChartType = "bar" | "pie";

export default function ChartTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dataText, setDataText] = useState(DEFAULT_DATA);
  const [optionsText, setOptionsText] = useState(DEFAULT_OPTIONS);
  const [cssText, setCssText] = useState(DEFAULT_CSS);
  const [message, setMessage] = useState("");

  const generateChart = () => {
    try {
      const data = JSON.parse(dataText);
      const options = optionsText.trim() ? JSON.parse(optionsText) : {};
      if (!canvasRef.current) return;
      chartRef.current?.destroy();
      chartRef.current = new Chart(canvasRef.current, { type: chartType, data, options } as never);
      setMessage("차트를 생성했습니다.");
    } catch (error) {
      setMessage(`JSON을 확인해 주세요: ${error instanceof Error ? error.message : "형식 오류"}`);
    }
  };

  useEffect(() => {
    generateChart();
    return () => chartRef.current?.destroy();
    // Initial preview is intentionally created once. Subsequent updates use the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyPrompt = async () => { try { await navigator.clipboard.writeText(AI_PROMPT); setMessage("AI 프롬프트를 클립보드에 복사했습니다."); } catch { setMessage("클립보드 접근을 허용한 뒤 다시 시도해 주세요."); } };
  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return setMessage("이미지를 만들지 못했습니다.");
      try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); setMessage("차트 이미지를 클립보드에 복사했습니다."); } catch { setMessage("이 브라우저에서는 이미지 복사를 지원하지 않습니다. JPG 저장을 이용해 주세요."); }
    }, "image/png");
  };
  const downloadImage = () => { const canvas = canvasRef.current; if (!canvas) return; const link = document.createElement("a"); link.download = "chart-result.jpg"; link.href = canvas.toDataURL("image/jpeg", 1); link.click(); setMessage("JPG 파일 저장을 시작했습니다."); };
  const fieldClass = "min-h-64 w-full resize-y border border-gray-300 bg-white p-3 font-mono text-sm leading-6 text-gray-900 outline-none focus:border-gray-950 dark:border-dark-600 dark:bg-dark-950 dark:text-dark-100 dark:focus:border-white";

  return <section className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6"><div className="flex flex-col gap-4 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-dark-700"><div><p className="text-sm font-semibold text-primary-600">CHART</p><h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">차트 생성기</h1><p className="mt-3 text-sm leading-6 text-gray-600 dark:text-dark-300">데이터와 옵션을 JSON으로 입력해 차트를 바로 만들고 내보냅니다.</p></div><button type="button" onClick={copyPrompt} className="inline-flex h-10 items-center justify-center gap-2 border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:border-dark-600 dark:text-dark-100 dark:hover:bg-dark-800"><Clipboard className="h-4 w-4" /> AI 프롬프트 복사</button></div><div className="mt-7 flex gap-3">{[{ value: "bar" as const, label: "막대 차트", Icon: BarChart3 }, { value: "pie" as const, label: "원형 차트", Icon: PieChart }].map(({ value, label, Icon }) => <button key={value} type="button" onClick={() => setChartType(value)} className={`flex h-20 w-28 flex-col items-center justify-center gap-1 border text-sm font-medium transition-colors ${chartType === value ? "border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200"}`}><Icon className="h-5 w-5" /> {label}</button>)}</div><div className="mt-7 grid gap-4 lg:grid-cols-3"><label className="grid gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100">데이터 (JSON)<textarea value={dataText} onChange={(event) => setDataText(event.target.value)} className={fieldClass} spellCheck={false} /></label><label className="grid gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100">옵션 (JSON)<textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} className={fieldClass} spellCheck={false} /></label><label className="grid gap-2 text-sm font-semibold text-gray-800 dark:text-dark-100">사용자 CSS<textarea value={cssText} onChange={(event) => setCssText(event.target.value)} className={fieldClass} spellCheck={false} /></label></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={generateChart} className="inline-flex h-11 items-center justify-center gap-2 bg-gray-950 px-5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-dark-100"><BarChart3 className="h-4 w-4" /> 차트 생성</button><button type="button" onClick={copyImage} className="inline-flex h-11 items-center justify-center gap-2 border border-gray-300 px-5 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-dark-600 dark:text-dark-100 dark:hover:bg-dark-800"><Copy className="h-4 w-4" /> 이미지 복사</button><button type="button" onClick={downloadImage} className="inline-flex h-11 items-center justify-center gap-2 border border-gray-300 px-5 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-dark-600 dark:text-dark-100 dark:hover:bg-dark-800"><Download className="h-4 w-4" /> JPG 저장</button></div><p className="mt-3 min-h-6 text-sm text-gray-500 dark:text-dark-300" role="status">{message && <><Check className="mr-1 inline h-4 w-4" />{message}</>}</p><style>{cssText}</style><div id="tool-chart-canvas-wrap" className="mt-4 min-h-52 border border-gray-200 bg-white dark:border-dark-700"><canvas ref={canvasRef} /></div></section>;
}

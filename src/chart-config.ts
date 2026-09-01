import type { EChartsOption } from "echarts";
import { parse } from "yaml";

export const MIN_CHART_HEIGHT = 160;
export const MAX_CHART_HEIGHT = 2000;
export const DEFAULT_CHART_HEIGHT = 360;

export type ChartRenderer = "canvas" | "svg";

export interface LinkedChartConfig {
  height: number;
  renderer: ChartRenderer;
  ariaLabel: string;
  option: EChartsOption;
}

export class ChartConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChartConfigError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseHeight(value: unknown): number {
  if (value === undefined) {
    return DEFAULT_CHART_HEIGHT;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < MIN_CHART_HEIGHT ||
    value > MAX_CHART_HEIGHT
  ) {
    throw new ChartConfigError(
      `height 必须是 ${MIN_CHART_HEIGHT}–${MAX_CHART_HEIGHT} 之间的数字。`,
    );
  }

  return value;
}

function parseRenderer(value: unknown): ChartRenderer {
  if (value === undefined) {
    return "canvas";
  }

  if (value !== "canvas" && value !== "svg") {
    throw new ChartConfigError('renderer 只能是 "canvas" 或 "svg"。');
  }

  return value;
}

function parseAriaLabel(value: unknown): string {
  if (value === undefined) {
    return "交互式 ECharts 图表";
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ChartConfigError("ariaLabel 必须是非空字符串。");
  }

  return value.trim();
}

export function parseChartConfig(source: string): LinkedChartConfig {
  let parsed: unknown;

  try {
    parsed = parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知 YAML 错误";
    throw new ChartConfigError(`无法解析 YAML：${message}`);
  }

  if (!isRecord(parsed)) {
    throw new ChartConfigError("图表配置必须是 YAML 对象。");
  }

  if (!isRecord(parsed.option)) {
    throw new ChartConfigError("缺少 option，或 option 不是对象。");
  }

  return {
    height: parseHeight(parsed.height),
    renderer: parseRenderer(parsed.renderer),
    ariaLabel: parseAriaLabel(parsed.ariaLabel),
    option: parsed.option as EChartsOption,
  };
}

export function formatChartError(error: unknown): string {
  if (error instanceof ChartConfigError) {
    return error.message;
  }

  return "图表渲染失败。请检查 option 是否符合 ECharts 配置格式。";
}

import { describe, expect, it } from "vitest";

import {
  ChartConfigError,
  DEFAULT_CHART_HEIGHT,
  formatChartError,
  parseChartConfig,
} from "../src/chart-config";

describe("parseChartConfig", () => {
  it("parses a minimal option with safe defaults", () => {
    const config = parseChartConfig(`
option:
  xAxis: {}
  yAxis: {}
  series: []
`);

    expect(config.height).toBe(DEFAULT_CHART_HEIGHT);
    expect(config.renderer).toBe("canvas");
    expect(config.ariaLabel).toBe("交互式 ECharts 图表");
    expect(config.option).toMatchObject({ series: [] });
  });

  it("accepts explicit presentation fields", () => {
    const config = parseChartConfig(`
height: 480
renderer: svg
ariaLabel: 月度价格图
option:
  series:
    - type: line
      data: [1, 2, 3]
`);

    expect(config.height).toBe(480);
    expect(config.renderer).toBe("svg");
    expect(config.ariaLabel).toBe("月度价格图");
  });

  it.each([
    ["", "图表配置必须是 YAML 对象"],
    ["- item", "图表配置必须是 YAML 对象"],
    ["height: 360", "缺少 option"],
    ["option: []", "缺少 option"],
    ["height: 100\noption: {}", "height 必须"],
    ["height: 2100\noption: {}", "height 必须"],
    ["renderer: webgl\noption: {}", "renderer 只能"],
    ["ariaLabel: '   '\noption: {}", "ariaLabel 必须"],
  ])("rejects invalid config %#", (source, expectedMessage) => {
    expect(() => parseChartConfig(source)).toThrow(expectedMessage);
  });

  it("wraps YAML parser errors", () => {
    expect(() => parseChartConfig("option: ["))
      .toThrowError(/无法解析 YAML/u);
  });
});

describe("formatChartError", () => {
  it("keeps actionable configuration messages", () => {
    expect(formatChartError(new ChartConfigError("具体错误"))).toBe("具体错误");
  });

  it("hides unexpected runtime details", () => {
    expect(formatChartError(new Error("sensitive runtime details"))).toBe(
      "图表渲染失败。请检查 option 是否符合 ECharts 配置格式。",
    );
  });
});

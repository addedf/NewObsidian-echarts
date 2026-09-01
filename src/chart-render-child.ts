import * as echarts from "echarts";
import type { ECharts } from "echarts";
import {
  App,
  HoverParent,
  HoverPopover,
  Keymap,
  MarkdownRenderChild,
} from "obsidian";

import {
  formatChartError,
  LinkedChartConfig,
  parseChartConfig,
} from "./chart-config";
import {
  ChartInteractionParams,
  getLinkedNoteTarget,
  getNativeMouseEvent,
} from "./link-interactions";

const HOVER_SOURCE = "linked-echarts";

interface ObsidianChartTheme {
  backgroundColor: string;
  color: string[];
  textStyle: {
    color: string;
  };
  title: {
    textStyle: { color: string };
    subtextStyle: { color: string };
  };
  legend: {
    textStyle: { color: string };
  };
  categoryAxis: {
    axisLine: { lineStyle: { color: string } };
    axisLabel: { color: string };
    splitLine: { lineStyle: { color: string } };
  };
  valueAxis: {
    axisLine: { lineStyle: { color: string } };
    axisLabel: { color: string };
    splitLine: { lineStyle: { color: string } };
  };
}

function readCssVariable(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = styles.getPropertyValue(name).trim();
  return value.length > 0 ? value : fallback;
}

function createObsidianTheme(): ObsidianChartTheme {
  const styles = getComputedStyle(document.body);
  const text = readCssVariable(styles, "--text-normal", "#444");
  const muted = readCssVariable(styles, "--text-muted", "#777");
  const border = readCssVariable(styles, "--background-modifier-border", "#ddd");

  return {
    backgroundColor: "transparent",
    color: [
      readCssVariable(styles, "--interactive-accent", "#5470c6"),
      readCssVariable(styles, "--color-green", "#91cc75"),
      readCssVariable(styles, "--color-yellow", "#fac858"),
      readCssVariable(styles, "--color-red", "#ee6666"),
      readCssVariable(styles, "--color-purple", "#9a60b4"),
      readCssVariable(styles, "--color-cyan", "#3ba272"),
    ],
    textStyle: { color: text },
    title: {
      textStyle: { color: text },
      subtextStyle: { color: muted },
    },
    legend: { textStyle: { color: text } },
    categoryAxis: {
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: border } },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: border } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: border } },
    },
  };
}

export class LinkedEchartsRenderChild
  extends MarkdownRenderChild
  implements HoverParent
{
  hoverPopover: HoverPopover | null = null;

  private chart: ECharts | null = null;
  private chartEl: HTMLDivElement | null = null;
  private config: LinkedChartConfig | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private themeClass = "";

  constructor(
    private readonly app: App,
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly sourcePath: string,
  ) {
    super(containerEl);
  }

  onload(): void {
    this.containerEl.empty();
    this.containerEl.addClass("linked-echarts");

    try {
      this.config = parseChartConfig(this.source);
      this.chartEl = this.containerEl.createDiv({
        cls: "linked-echarts__canvas",
        attr: {
          role: "img",
          "aria-label": this.config.ariaLabel,
        },
      });
      this.chartEl.style.height = `${this.config.height}px`;

      this.renderChart();
      this.observeSize();
      this.observeTheme();
    } catch (error) {
      this.renderError(formatChartError(error));
    }
  }

  onunload(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.disposeChart();
    this.chartEl = null;
    this.config = null;
  }

  private renderChart(): void {
    if (this.chartEl === null || this.config === null) {
      return;
    }

    this.disposeChart();
    this.chart = echarts.init(this.chartEl, createObsidianTheme(), {
      renderer: this.config.renderer,
    });
    this.chart.setOption(this.config.option);
    this.bindInteractions(this.chart);
  }

  private bindInteractions(chart: ECharts): void {
    chart.on("click", (rawParams: unknown) => {
      const params = rawParams as ChartInteractionParams;
      const linktext = getLinkedNoteTarget(params.data);
      if (linktext === null) {
        return;
      }

      const nativeEvent = getNativeMouseEvent(params);
      const newLeaf = nativeEvent === null ? false : Keymap.isModEvent(nativeEvent);
      void this.app.workspace.openLinkText(linktext, this.sourcePath, newLeaf);
    });

    chart.on("mouseover", (rawParams: unknown) => {
      const params = rawParams as ChartInteractionParams;
      const linktext = getLinkedNoteTarget(params.data);
      const nativeEvent = getNativeMouseEvent(params);
      if (linktext === null || nativeEvent === null || this.chartEl === null) {
        return;
      }

      this.chartEl.addClass("is-linked");
      this.app.workspace.trigger("hover-link", {
        event: nativeEvent,
        source: HOVER_SOURCE,
        hoverParent: this,
        targetEl: this.chartEl,
        linktext,
        sourcePath: this.sourcePath,
      });
    });

    chart.on("mouseout", () => {
      this.chartEl?.removeClass("is-linked");
    });
  }

  private observeSize(): void {
    if (this.chartEl === null) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.resizeObserver.observe(this.chartEl);
  }

  private observeTheme(): void {
    this.themeClass = document.body.className;
    this.themeObserver = new MutationObserver(() => {
      const nextThemeClass = document.body.className;
      if (nextThemeClass === this.themeClass) {
        return;
      }

      this.themeClass = nextThemeClass;
      try {
        this.renderChart();
      } catch (error) {
        this.renderError(formatChartError(error));
      }
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  private disposeChart(): void {
    this.chart?.dispose();
    this.chart = null;
    this.chartEl?.removeClass("is-linked");
  }

  private renderError(message: string): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.disposeChart();
    this.containerEl.empty();
    const errorEl = this.containerEl.createDiv({ cls: "linked-echarts__error" });
    errorEl.createEl("strong", { text: "Linked ECharts 配置错误" });
    errorEl.createDiv({ text: message });
  }
}

import { Plugin } from "obsidian";

import { LinkedEchartsRenderChild } from "./chart-render-child";

const CODE_BLOCK_LANGUAGE = "linked-echarts";

export default class LinkedEchartsPlugin extends Plugin {
  onload(): void {
    this.registerMarkdownCodeBlockProcessor(
      CODE_BLOCK_LANGUAGE,
      (source, el, context) => {
        context.addChild(
          new LinkedEchartsRenderChild(
            this.app,
            el,
            source,
            context.sourcePath,
          ),
        );
      },
    );
  }
}

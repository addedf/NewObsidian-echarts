# Linked ECharts

在 Obsidian 的 Markdown 笔记中嵌入交互式 ECharts 图表。为数据点或事件标记添加 `note` 字段，即可点击打开关联笔记，并通过悬浮查看页面预览。

## 当前功能

- 使用 YAML 编写 `linked-echarts` 代码块，在笔记内直接渲染图表。
- 集成完整 ECharts，支持折线图、柱状图、饼图、K 线图、事件标记和数据缩放等配置。
- 点击带有 `note` 的数据点或 `markPoint`，通过 Obsidian 原生导航打开关联笔记。
- 使用 Obsidian 原生页面预览机制展示悬浮内容。
- 适配图表容器尺寸和 Obsidian 明暗主题，卸载时释放图表实例及监听器。
- 仅解析声明式配置，不执行笔记中的 JavaScript。

更多折线图与 K 线配置可查看[图表示例](examples/linked-echarts-example.md)。

## 配置示例

在笔记中插入以下代码块，并将 `note` 改为笔记库中实际存在的路径：

````markdown
```linked-echarts
height: 420
renderer: canvas
ariaLabel: 带有复盘笔记链接的价格走势图
option:
  xAxis:
    type: category
    data: ['2026-08-30', '2026-08-31']
  yAxis:
    type: value
  series:
    - name: 收盘价
      type: line
      data:
        - value: 100
        - value: 105
          note: "[[研究/财报事件#结论|查看事件]]"
```
````

顶层配置字段：

| 字段 | 说明 |
|---|---|
| `option` | 必填，传入 ECharts 的图表配置 |
| `height` | 图表高度，默认 360 像素，范围为 160–2000 |
| `renderer` | 渲染方式，可选 `canvas`（默认）或 `svg` |
| `ariaLabel` | 用于辅助阅读的图表描述 |

`note` 接受笔记库内路径或 `[[双链]]` 格式，支持标题、块引用和显示别名。插件会去掉显示别名，再交给 Obsidian 解析目标；外部网址协议不作为笔记目标处理。

## 反向链接限制

Obsidian 通常不会将代码围栏中的双链作为普通 Markdown 链接建立索引。当前版本提供点击导航和悬浮预览，但仅填写 `note` 不保证产生反向链接，也不保证笔记重命名后自动更新。

需要反向链接或重命名跟随时，请同时在正文或宿主支持的 frontmatter 属性中保留真实链接。自动读取结构化事件笔记的能力仍在规划中。

## 开发与安装

最低 Obsidian 版本为 **1.8.0**。已验证的开发环境为 **Node.js 22.19.0**；请遵守锁定依赖的运行环境要求，当前 Vitest 4 不支持 Node.js 18。

在项目根目录执行：

```bash
npm ci
npm test
npm run test:coverage
npm run build
```

持续监听源码变化并重新构建：

```bash
npm run dev
```

手动安装时，将构建生成的 `main.js` 与项目中的 `manifest.json`、`styles.css` 复制到：

```text
<笔记库>/.obsidian/plugins/linked-echarts/
```

如果修改过 Obsidian 配置目录，请使用对应目录替换 `.obsidian`。重新加载 Obsidian，然后在“第三方插件”中启用 **Linked ECharts**。源码仓库不包含构建生成的 `main.js`，需先完成构建。

## 开发状态与后续计划

当前版本为 `0.1.0`，使用 YAML 创建图表。已有单元测试和生产构建验证，真实 Obsidian 宿主中的点击、悬浮、主题切换及移动端行为仍待完整验收。

以下能力处于设计阶段，尚未实现：

- 在侧栏或工作区中输入表格、选择图表类型、预览并插入图表。
- 导入自定义 CSS 主题，在建图时选择应用，并保存单图样式快照。
- 多维数据处理、事件笔记自动关联和 K 线复盘工作流。

## 参考项目与许可证

- [Obsidian 插件示例](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Obsidian Scatter](https://github.com/MartinSeeler/obsidian-scatter)
- [Fancy Charts](https://github.com/robertoallende/fancy-charts)
- [Bases Chart Views](https://github.com/haiqiang-zhang/obsidian-bases-charts)：GPL-3.0 项目，仅参考产品行为与设计，不复制其实现。

本项目独立实现，采用 [MIT 许可证](LICENSE)。

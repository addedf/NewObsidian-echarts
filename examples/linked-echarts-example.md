# Linked ECharts 示例

将下面代码块复制到 Obsidian 笔记。把 `note` 改成库内真实笔记；点击带链接的数据点或事件标记会打开笔记，桌面端悬浮会调用 Obsidian 原生页面预览。

## 折线图

```linked-echarts
height: 360
ariaLabel: 带事件链接的价格折线图
option:
  tooltip:
    trigger: axis
  xAxis:
    type: category
    data: [2026-08-27, 2026-08-28, 2026-08-31]
  yAxis:
    type: value
  series:
    - name: 收盘价
      type: line
      data:
        - value: 101
        - value: 104
          note: "[[示例/财报超预期]]"
        - value: 102
      markPoint:
        symbolSize: 58
        data:
          - name: 重要事件
            coord: [2026-08-28, 104]
            value: 财报
            note: "[[示例/财报超预期#结论|查看事件]]"
```

## K 线图

```linked-echarts
height: 460
ariaLabel: 带事件链接的 K 线图
option:
  animation: false
  tooltip:
    trigger: axis
    axisPointer:
      type: cross
  xAxis:
    type: category
    data: [2026-08-27, 2026-08-28, 2026-08-31, 2026-09-01]
  yAxis:
    scale: true
  dataZoom:
    - type: inside
    - type: slider
  series:
    - name: 日 K
      type: candlestick
      data:
        - [100, 103, 98, 105]
        - [103, 108, 102, 110]
        - [108, 106, 104, 109]
        - [106, 112, 105, 113]
      markPoint:
        data:
          - name: 事件
            coord: [2026-08-28, 110]
            value: 决策
            note: "[[示例/交易决策-2026-08-28]]"
```

> [!important]
> 代码块里的 `note` 能提供导航和预览，但不保证被 Obsidian 当作正文双链建立反向链接。需要真实反向链接时，请同时在正文或 frontmatter 中放置对应 Wikilink。

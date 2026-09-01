# Linked ECharts

Linked ECharts renders declarative ECharts configurations directly inside Obsidian Markdown. Any ECharts data item or `markPoint` carrying a `note` field can open and preview an Obsidian note.

## First-version capabilities

- `linked-echarts` fenced Markdown code blocks written in YAML.
- Full ECharts package, including candlestick charts, mark points and data zoom.
- Native `app.workspace.openLinkText()` navigation on click.
- Native `hover-link` page preview through an Obsidian `HoverParent`.
- Responsive resizing, Obsidian theme colors and lifecycle cleanup.
- No JavaScript evaluation from notes.

See [`examples/linked-echarts-example.md`](examples/linked-echarts-example.md) for line and candlestick examples.

## Configuration

````markdown
```linked-echarts
height: 420
renderer: canvas
ariaLabel: Price chart with linked events
option:
  xAxis:
    type: category
    data: [2026-08-30, 2026-08-31]
  yAxis:
    type: value
  series:
    - type: line
      data:
        - value: 100
        - value: 105
          note: "[[Research/Earnings event#Conclusion|Open event]]"
```
````

Top-level fields:

- `option` is required and is passed to ECharts.
- `height` defaults to 360 and must be between 160 and 2000.
- `renderer` is `canvas` (default) or `svg`.
- `ariaLabel` provides an accessible chart description.

`note` accepts a vault path or a Wikilink-like string. Aliases are removed before Obsidian resolves the link. External URL schemes are intentionally rejected.

## Backlink limitation

Obsidian does not normally index Wikilinks inside fenced code blocks as Markdown links. The first version provides navigation and hover preview, but a `note` field alone may not create a backlink. Keep real links in normal Markdown or frontmatter when backlink indexing and rename tracking are required. A structured event-note provider is planned for a later version.

## Development

Requirements: Node.js 18 or newer.

```bash
npm install
npm test
npm run test:coverage
npm run build
```

For manual installation, copy `manifest.json`, `main.js` and `styles.css` into:

```text
<vault>/.obsidian/plugins/linked-echarts/
```

Then reload Obsidian and enable **Linked ECharts** in Community plugins.

## Design references

- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Obsidian Scatter](https://github.com/MartinSeeler/obsidian-scatter)
- [Fancy Charts](https://github.com/robertoallende/fancy-charts)
- [Bases Chart Views](https://github.com/haiqiang-zhang/obsidian-bases-charts) (GPL-3.0, design reference only)

This project is an independent MIT implementation.

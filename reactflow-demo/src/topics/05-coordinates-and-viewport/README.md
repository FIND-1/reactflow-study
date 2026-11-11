# 05 · 坐标与视口

- 笔记：[05-坐标与视口.md](../../../../notes/05-坐标与视口.md)
- 源码地图：[5. 坐标与视口](../../../../SOURCE_MAP.md#5-坐标与视口)
- 练习：[ViewportExercise.tsx](ViewportExercise.tsx)
- 样式：[viewport.css](viewport.css)
- 注册表：[topics/index.ts](../index.ts)
- 官方文档：[The Viewport](https://reactflow.dev/learn/concepts/the-viewport)
- 前置：T01 · 受控流（会用到 `onNodesChange` 日志判断“视口变化不产生节点 changes”）
- 状态：笔记完成（V1–V4 已实现，待 review 验收）。
- 页面：在 demo 本地地址后附加 `#topics/05-coordinates-and-viewport`。

## 练习内容

已准备并实现：三个节点 A/B/C、固定初始视口 `{ x: 80, y: 60, zoom: 1 }`（不用 `fitView`，方便对照换算）、页面上的实时 viewport 读数、点击空白处的坐标日志、`onMoveEnd` 日志，以及只打印类型的 `onNodesChange` 日志。

已完成的练习项（想自己重练可临时清空对应位置）：

| 编号 | 位置 | 内容 |
| --- | --- | --- |
| V1 | `designToolProps` | 设计工具式操作：`panOnScroll: true`、`panOnDrag: false`、`selectionOnDrag: true`、`selectionMode: SelectionMode.Partial` |
| V2 | `toFlowPosition` | 用 `screenToFlowPosition` 把 client 坐标换算成流程坐标 |
| V3 | `handlePaneClick` 的放置分支 | 在点击处按流程坐标新增节点 |
| V4 | `focusNodeB` / `resetViewport` | `fitView({ nodes: [{ id: 'b' }], duration: 400 })` 聚焦节点 B；`setViewport(initialViewport, { duration: 400 })` 回到初始视口 |

## 功能边界

- 不包含自定义节点、新建连线、视口限制（`translateExtent`、`minZoom` / `maxZoom`）和受控 `viewport` 属性。
- 切换操作方式只改交互配置，不重置画布；切换章节或刷新恢复初始节点和视口，视口不持久保存。
- 注释中标“推断（待实测）”的内容（如 `onMoveEnd` 在程序调用时 event 为空）需要在笔记里回填实测结果。

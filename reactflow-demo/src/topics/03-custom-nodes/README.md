# 03 · 自定义节点

- 笔记：[03-自定义节点.md](../../../../notes/03-自定义节点.md)
- 源码地图：[3. 自定义节点](../../../../SOURCE_MAP.md#3-自定义节点)
- 练习：[CustomNodesExercise.tsx](CustomNodesExercise.tsx)
- 样式：[custom-nodes.css](custom-nodes.css)
- 注册表：[topics/index.ts](../index.ts)
- 官方文档：[Nodes](https://reactflow.dev/learn/customization/custom-nodes)、[Utility Classes](https://reactflow.dev/learn/customization/utility-classes)、[TypeScript](https://reactflow.dev/learn/advanced-use/typescript)
- 前置：T01 · 受控流、T02 · 连线
- 状态：骨架已准备（N1–N3 待学习者填写）。
- 页面：在 demo 本地地址后附加 `#topics/03-custom-nodes`。

## 练习内容

已准备：1 个内置 `default` 节点与 2 个 `inspectorCard` 类型的节点数据、带类型注解的 `InspectorCardNodeComponent`（含左右 `Handle`、标题输入框、步数滑块、可滚动备注列表，以及 `selected` / `dragging` 状态展示），并接好了 `onError`（用于观察未注册 `nodeTypes` 时的 `003` 告警）和 `onNodesChange` 日志。

待填写的 TODO：

| 编号 | 位置 | 内容 |
| --- | --- | --- |
| N3（建议先填） | `nodeTypes` | 在模块顶层把 `inspectorCard` 映射到 `InspectorCardNodeComponent`，消除 `003` 回退告警 |
| N1 | `UTILITY_CLASSES` | 填写 `nodrag`、`nowheel`、`nopan`，让节点内输入框、滑块和滚动框不与画布手势冲突 |
| N2-a / N2-b | `handleTitleChange` / `handleStepChange` | 用 `useReactFlow().updateNodeData` 把输入和滑块的新值写回节点 `data` |

## 功能边界

- 本章只覆盖自定义节点注册、`NodeProps` 类型与常用字段、节点内部调用 `updateNodeData` 更新自身 `data`，以及 `nodrag` / `nowheel` / `nopan` 三个工具类名。
- 不包含自定义边、节点间跨节点数据计算（留给 T08 · 节点间数据流）或持久化。
- 切换章节或刷新页面会恢复初始节点数据。

# 04 · Store 与 Hooks

- 笔记：[04-Store与Hooks.md](../../../../notes/04-Store与Hooks.md)
- 源码地图：[4. Store 与 Hooks](../../../../SOURCE_MAP.md#4-store-与-hooks)
- 练习：[StoreAndHooksExercise.tsx](StoreAndHooksExercise.tsx)
- 样式：[store-and-hooks.css](store-and-hooks.css)
- 注册表：[topics/index.ts](../index.ts)
- 官方文档：[Hooks and Providers](https://reactflow.dev/learn/advanced-use/hooks-providers)、[State Management](https://reactflow.dev/learn/advanced-use/state-management)
- 前置：T01 · 受控流、T03 · 自定义节点
- 状态：笔记完成（S1–S3 已实现，待 review 验收）。
- 页面：在 demo 本地地址后附加 `#topics/04-store-and-hooks`。

## 练习内容

已准备并实现：外层显式包裹的 `<ReactFlowProvider>`、与画布平级隔离的兄弟组件 `StoreInspectorBar`（展示节点数、边数、已选节点 ID 列表及排除 `<StrictMode>` 干扰的真实提交计数器），以及 3 个节点与 2 条连线的起始图。

已完成的练习项（想自己重练可临时清空对应位置）：

| 编号 | 位置 | 内容 |
| --- | --- | --- |
| S1 | `summarySelector` | 编写 Zustand selector 提取 `nodeCount`、`edgeCount`、`selectedIds`，配合 `isSameSummary` 过滤拖拽与平移时的无关更新 |
| S2 | `handleDumpSnapshot` | 用 `useStoreApi().getState()` 按需一次性读取 store 快照（`transform`、`nodeLookup` 等），验证不增加组件渲染次数 |
| S3-a / S3-b | `handleSelectAll` / `handleAppendNode` | 用 `useReactFlow()` 的 `setNodes` 全选节点、`addNodes` 新增节点，观察受控状态同步与顶部状态栏响应 |

## 功能边界

- 本章重点区分 `<ReactFlowProvider>` 的作用域边界，以及 `useStore`（响应式切片订阅）、`useStoreApi`（命令式按需读取）、`useReactFlow`（高层操作实例）三者的职责与重渲染影响。
- 不引入外部 Redux / 独立业务 Zustand 仓库接管全部状态，聚焦 React Flow 内置 store 与 Hooks 机制。
- 切换章节或刷新页面会恢复初始图。

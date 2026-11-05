# React Flow 源码地图

## 版本与检索依据

- 工作目录：`D:/1project/Flows/reactflow-study`；学习笔记目录：`notes/`。
- 源码仓库：<https://github.com/xyflow/xyflow>，本地目录：`xyflow/`。
- demo 的 `reactflow-demo/package.json` 声明：`@xyflow/react: ^12.12.1`。
- 实际安装包版本：**12.12.1**，读取自 `reactflow-demo/node_modules/.pnpm/@xyflow+react@12.12.1_@type_256bf96b73582261ce8288c23eb38273/node_modules/@xyflow/react/package.json` 的 `version` 字段，并非根据依赖范围或文件夹名称推断。
- 注意：`reactflow-demo/node_modules/@xyflow/react` 的 Junction 仍指向旧位置 `D:/1project/Flows/reactflow-demo/node_modules/.pnpm/...`，直接读取该入口返回 ENOENT；本次未修复或修改 demo 的依赖链接。
- 已 checkout：**`@xyflow/react@12.12.1`**（detached HEAD）。
- 提交：`1bc405cd113618c17fd181b931a9fe573bec9fee`；源码 `packages/react/package.json` 的版本也为 `12.12.1`。
- 使用 `git tag | grep '@xyflow/react'` 核对 tag（PowerShell 中调用 Git 自带的 `grep.exe`），使用 `rg -n` 和 `git grep -n -E` 检索下列两个源码目录，并读取命中位置的实现确认作用。
- 除用户要求的 clone / checkout 外，没有编辑 `xyflow/` 内的文件，也没有执行依赖安装或构建。

以下路径均相对于当前 `reactflow-study/` 目录，行号对应上述 tag。函数名列对组件包装、对象方法及回调调用点作了明确区分；CSS 类名和配置属性不冒充独立函数。

## 1. 受控流

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| useNodesState | `xyflow/packages/react/src/hooks/useNodesEdgesState.ts:51` | `useNodesState` | 返回节点状态、setter 及调用 `applyNodeChanges` 的 `onNodesChange`，供外部管理受控节点。 |
| useEdgesState | `xyflow/packages/react/src/hooks/useNodesEdgesState.ts:115` | `useEdgesState` | 返回边状态、setter 及调用 `applyEdgeChanges` 的 `onEdgesChange`，供外部管理受控边。 |
| applyNodeChanges | `xyflow/packages/react/src/utils/changes.ts:182` | `applyNodeChanges` | 将节点变更数组交给内部 `applyChanges`，返回应用变更后的节点数组。 |
| applyEdgeChanges | `xyflow/packages/react/src/utils/changes.ts:220` | `applyEdgeChanges` | 将边变更数组交给内部 `applyChanges`，返回应用变更后的边数组。 |
| 共用变更处理 | `xyflow/packages/react/src/utils/changes.ts:19` | `applyChanges` | 按元素 ID 汇总变更，处理增删替换及属性更新，并保留未变更元素的对象引用。 |

## 2. 连线

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| addEdge（React 入口） | `xyflow/packages/react/src/utils/edges.ts:13` | `addEdge` | 为 system 层的 `addEdge` 补充默认错误报告回调并委托处理。 |
| addEdge（实际处理） | `xyflow/packages/system/src/utils/edges/general.ts:139` | `addEdge` | 检查 source/target、为连接生成 ID、排除重复连接并返回添加新边后的数组。 |
| Handle | `xyflow/packages/react/src/components/Handle/index.tsx:88` | `HandleComponent`（第 307 行包装导出为 `Handle`） | 渲染连接点并把拖动连线交互交给 `XYHandle`，同时处理点击连接等行为。 |
| isValidConnection | `xyflow/packages/system/src/xyhandle/XYHandle.ts:252` | `isValidHandle`（第 315 行调用 `isValidConnection(connection)`） | 在连接点可连接性与连接模式检查通过后，调用传入的业务校验回调决定连接是否合法。 |
| xyhandle | `xyflow/packages/system/src/xyhandle/XYHandle.ts:26` | `onPointerDown`（通过第 323 行的 `XYHandle` 对象暴露） | 管理从连接点开始的拖动连线过程，包括连接状态、候选连接点和连接生命周期回调。 |

`isValidConnection` 是外部传入的回调属性，不是库内同名的独立业务校验函数；`XYHandle.isValid` 实际映射到 `isValidHandle`。React 层传递校验回调的入口位于 `components/Handle/index.tsx:170`，点击连接校验位于同文件第 210 行。

## 3. 自定义节点

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| nodeTypes | `xyflow/packages/react/src/components/NodeWrapper/index.tsx:23` | `NodeWrapper`（第 56 行读取 `nodeTypes?.[nodeType]`） | 根据节点类型选择用户注册组件或内置组件，并为节点提供交互包装。 |
| nodrag / nowheel 默认名称 | `xyflow/packages/react/src/container/ReactFlow/index.tsx:24` | `ReactFlow`（第 121–122 行定义默认值） | 将 `noDragClassName` 和 `noWheelClassName` 默认设为 `nodrag` 与 `nowheel` 并向下传递。 |
| nodrag | `xyflow/packages/system/src/xydrag/XYDrag.ts:100` | `XYDrag`（内部拖动 filter 在第 408 行检查类名） | 通过 `noDragClassName` 检查事件目标及祖先元素，阻止从匹配区域启动节点拖动。 |
| nowheel：缩放过滤 | `xyflow/packages/system/src/xypanzoom/filter.ts:19` | `createFilter`（第 65 行检查类名） | 当 wheel 事件发生在 `noWheelClassName` 对应区域内时，拒绝画布缩放处理。 |
| nowheel：滚轮平移 | `xyflow/packages/system/src/xypanzoom/eventhandler.ts:61` | `createPanOnScrollHandler`（第 74 行检查类名） | 在 `noWheelClassName` 对应区域内提前返回，阻止滚轮触发画布平移。 |

`nodeTypes` 是组件映射配置，`nodrag` / `nowheel` 是默认 CSS 类名，上表列出的是消费这些配置的真实函数。

## 4. Store 与 Hooks

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| Store 创建 | `xyflow/packages/react/src/store/index.ts:26` | `createStore` | 使用 Zustand 的 `createWithEqualityFn` 创建包含节点、边、视口等状态和更新操作的 store。 |
| useStore | `xyflow/packages/react/src/hooks/useStore.ts:34` | `useStore` | 从上下文取得 store，通过 selector 和可选 equalityFn 订阅需要的状态切片。 |
| Store API | `xyflow/packages/react/src/hooks/useStore.ts:60` | `useStoreApi` | 暴露 `getState`、`setState` 和 `subscribe`，供调用方按需读取、更新或订阅 store。 |
| useReactFlow | `xyflow/packages/react/src/hooks/useReactFlow.ts:58` | `useReactFlow` | 组合节点与边操作、查询方法、视口辅助方法及初始化状态，返回 ReactFlowInstance。 |

## 5. 坐标与视口

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| screenToFlowPosition | `xyflow/packages/react/src/hooks/useViewportHelper.ts:84` | `screenToFlowPosition`（`useViewportHelper` 返回对象的方法） | 将 client 坐标减去画布容器偏移，再结合当前 transform 和可选网格吸附转换为流程图坐标。 |
| viewport 读写 | `xyflow/packages/react/src/hooks/useViewportHelper.ts:19` | `useViewportHelper`（含第 40 行 `setViewport`、第 61 行 `getViewport`） | 提供读取 `{ x, y, zoom }` 和通过 panZoom 设置视口的操作。 |
| 受控 viewport 同步 | `xyflow/packages/react/src/hooks/useViewportSync.ts:15` | `useViewportSync` | 将传入的 viewport 同步到 panZoom 实例和 store 的 transform。 |
| 视口 DOM 变换 | `xyflow/packages/react/src/container/Viewport/index.tsx:14` | `Viewport` | 订阅 store 并在 transform 变化时直接更新容器的 CSS transform，避免平移缩放时逐帧触发 React 渲染。 |
| XYPanZoom | `xyflow/packages/system/src/xypanzoom/XYPanZoom.ts:36` | `XYPanZoom` | 基于 d3-zoom 创建并管理画布平移缩放实例、视口约束和交互事件。 |

## 6. 自定义边

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| getBezierPath | `xyflow/packages/system/src/utils/edges/bezier-edge.ts:121` | `getBezierPath` | 根据源端与目标端坐标、方向和曲率计算贝塞尔 SVG 路径、标签位置及偏移量。 |
| EdgeRenderer | `xyflow/packages/react/src/container/EdgeRenderer/index.tsx:41` | `EdgeRendererComponent`（第 98 行经 memo 包装导出为 `EdgeRenderer`） | 获取待渲染边 ID，渲染 marker 定义并逐条创建 EdgeWrapper。 |
| 自定义边组件选择 | `xyflow/packages/react/src/components/EdgeWrapper/index.tsx:18` | `EdgeWrapper`（第 44 行读取 `edgeTypes?.[edgeType]`） | 根据边类型选择自定义或内置边组件，并提供边的交互包装。 |

## 7. 性能

| 入口 | 文件路径 : 行号 | 函数名 | 一句话作用 |
| --- | --- | --- | --- |
| memo | `xyflow/packages/react/src/container/NodeRenderer/index.tsx:103` | `memo(NodeRendererComponent)`（导出 `NodeRenderer`） | 使用 React.memo 包装节点列表组件，在 props 未变化时减少由父组件更新引发的重复渲染。 |
| selector | `xyflow/packages/react/src/container/NodeRenderer/index.tsx:31` | `selector`（第 39 行传入 `useStore(selector, shallow)`） | 只选取节点可连接性、焦点、选择开关和错误回调，使用浅比较减少无关状态变化引发的更新。 |
| 节点 ID 订阅 | `xyflow/packages/react/src/hooks/useVisibleNodeIds.ts:23` | `useVisibleNodeIds`（内部使用第 8 行的 `selector`） | 订阅全部或可见节点的 ID 列表，并用 shallow 比较避免 ID 列表未变时重复渲染。 |

`memo` 来自 React，这里记录的是仓库中的实际调用点，而不是把它描述为 xyflow 自行实现的函数。

## 复查命令与结果

在 `xyflow/` 中使用以下只读命令可以复查主要关键词；上表额外条目也通过定向 grep 和实现阅读核对。

```powershell
git tag | rg '@xyflow/react'
git describe --tags --exact-match
git rev-parse HEAD
git grep -n -E 'useNodesState|applyNodeChanges|applyEdgeChanges|addEdge|HandleComponent|isValidConnection|XYHandle' -- packages/react packages/system
git grep -n -E 'nodeTypes|nodrag|nowheel|noDragClassName|noWheelClassName|useStore|useReactFlow' -- packages/react packages/system
git grep -n -E 'screenToFlowPosition|viewport|XYPanZoom|getBezierPath|EdgeRenderer|memo\(|selector' -- packages/react packages/system
git status --porcelain
```

- **未找到条目：无。** 7 个知识点的全部指定关键词均有真实源码位置；非独立函数的关键词已注明对应实现入口。
- 本次只新增学习目录和 Markdown 文档，验证范围为安装包版本、tag、提交、源码路径、函数及关键调用位置、仓库工作区状态；未运行 lint、TypeScript 检查或 build，也未执行 `pnpm install`。

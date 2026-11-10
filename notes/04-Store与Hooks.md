# Store 与 Hooks 学习笔记

源码版本：`@xyflow/react@12.12.1`。地图：[SOURCE_MAP.md](../SOURCE_MAP.md#4-store-与-hooks)。
官方阅读：[Hooks and Providers](https://reactflow.dev/learn/advanced-use/hooks-providers)、[State Management](https://reactflow.dev/learn/advanced-use/state-management)。
练习：[StoreAndHooksExercise.tsx](../reactflow-demo/src/topics/04-store-and-hooks/StoreAndHooksExercise.tsx)。

## 记录约定

- **源码事实**：已在固定版本文件中读到的调用、分支或类型，不等于浏览器实测。
- **推断**：没有实测支撑的因果解释或预期行为；保留此标记直到实测。
- **实测**：写清操作、初始状态、日志与画布现象后才能标记；lint/build 通过不算实测。
- 预测写在实现之前，实测结果回填到「预测 vs 实际」表，不把预测改写成实际。

## 建议阅读顺序

路径以 `reactflow-study/` 为起点，行号对应上述 tag。

| 顺序 | 源码位置 | 阅读时回答的问题 |
| --- | --- | --- |
| 1 | `xyflow/packages/react/src/container/ReactFlow/Wrapper.tsx:41` 与 `components/ReactFlowProvider/index.tsx:96` | `<ReactFlow>` 自己内部已经包了 `Wrapper`，为什么画布外面的兄弟组件调 `useReactFlow` / `useStore` 还是会报 `001` 错误？外层显式包 `<ReactFlowProvider>` 后，`Wrapper` 会怎么做？ |
| 2 | `xyflow/packages/react/src/store/index.ts:26` · `createStore` | React Flow 内部用什么库创建 store？store 里除了 `nodes` / `edges` 还存了哪些高频变化的状态（如 `transform`、`nodeLookup`）？ |
| 3 | `xyflow/packages/react/src/hooks/useStore.ts:34` · `useStore` 与 `:60` · `useStoreApi` | `useStore` 和 `useStoreApi` 都从 `StoreContext` 取 store，为什么一个会触发组件重渲染，另一个不会？什么时候必须传第二个参数 `equalityFn`？ |
| 4 | `xyflow/packages/react/src/hooks/useReactFlow.ts:58` · `useReactFlow` | 调用 `useReactFlow()` 本身会订阅 `nodes` 或 `edges` 的变化吗？它的 `setNodes` / `addNodes` 是怎么把改动送回受控状态的？ |

## 核心机制（源码事实 + 已验证项）

1. 【源码事实】**`ReactFlowProvider` 与 `Wrapper` 的作用域边界**：
   - `<ReactFlow>` 渲染时会先经过 `Wrapper`（`container/ReactFlow/Wrapper.tsx:41-68`）：它调用 `const isWrapped = useContext(StoreContext)` 检查上层是否已经有 Provider。
   - 如果外层**没有** `<ReactFlowProvider>`，`Wrapper` 会在 `<ReactFlow>` **内部**包一层 `<ReactFlowProvider>`；此时只有 `<ReactFlow>` 的子组件（如自定义节点、自定义边、`<Panel>` 子元素）在 `StoreContext` 内，而画布外面的同级工具栏/状态栏拿到的 `StoreContext` 为 `null`，调用 `useStore` / `useStoreApi` / `useReactFlow` 会直接 `throw new Error(zustandErrorMessage)`（即 `error001`）。
   - 如果外层**已经显式包裹** `<ReactFlowProvider>`，`Wrapper` 检测到 `isWrapped` 非空，直接返回 `<>{children}</>` 复用外层的 `StoreContext`，不会创建第二个 store。
2. 【源码事实】**`createStore` 与受控同步链路**：
   - `ReactFlowProvider`（`components/ReactFlowProvider/index.tsx:108-132`）在首次挂载时用 `useState(() => createStore(...))` 创建一个基于 Zustand（`createWithEqualityFn`，见 `store/index.ts:1, 26`）的 store，并同时挂载 `<BatchProvider>`。
   - 在受控模式下，外部传入 `<ReactFlow nodes={nodes} edges={edges} />` 的 props 由内部组件 `StoreUpdater`（`components/StoreUpdater/index.tsx:140-165`）在 `useEffect` 中监听，一旦 `props.nodes` 引用变化，就调用 store 的 `setNodes` 同步进 Zustand store（更新 `state.nodes` 和 `state.nodeLookup`）。
3. 【源码事实】**三种访问 Store 的 Hook 职责对比**：
   - `useStore(selector, equalityFn)`（`hooks/useStore.ts:34-44`）：底层调用 `useZustandStore(store, selector, equalityFn)`。**响应式订阅**——每当 store 任意状态变化（包括拖拽每帧更新坐标、视口平移每帧更新 `transform`）都会运行 `selector`；若 `equalityFn(prevSlice, nextSlice)` 返回 `false`，就触发当前组件重渲染。若 `selector` 返回新对象或新数组，必须提供 `equalityFn`（如 `zustand/shallow` 或自定义比较函数），否则默认 `Object.is` 会导致每次 store 更新都重渲染。
   - `useStoreApi()`（`hooks/useStore.ts:60-77`）：只用 `useMemo` 返回 `{ getState, setState, subscribe }` 三个稳定引用，**完全不订阅状态、绝不会触发组件重渲染**。适合在点击按钮、事件回调里按需调用 `storeApi.getState()` 读取一次性快照。
   - `useReactFlow()`（`hooks/useReactFlow.ts:58-315`）：面向业务开发的高层实例。内部仅用 `useStore(selector)` 订阅了单个布尔值 `viewportInitialized`（初始化完成后不再变化），因此调用 `useReactFlow()` **不会因为节点拖拽或视口平移而重渲染**。它的 `setNodes` / `addNodes` 会把更新推入 `BatchProvider` 的 `nodeQueue`，经 `getElementsDiffChanges` 转成 `NodeChange[]` 交给受控画布的 `onNodesChange`。

## 我读了哪些文件

- [x] `container/ReactFlow/Wrapper.tsx` 与 `components/ReactFlowProvider/index.tsx`
- [x] `components/StoreUpdater/index.tsx`（受控 `props.nodes` 同步进 store 的时机）
- [x] `store/index.ts`（`createStore`）
- [x] `hooks/useStore.ts`（`useStore` / `useStoreApi`）
- [x] `hooks/useReactFlow.ts`（`useReactFlow`）

## 预测 vs 实际

| 场景与操作 | 预测（推断） | 实际 | 日志 / 证据 | 吻合？ |
| --- | --- | --- | --- | --- |
| 骨架阶段（未拆平级组件 + `<StrictMode>` 直接在渲染体计数）点击选中一个节点 | 预期状态栏只渲染 1 次 | 【实测】每选中一个节点，「状态栏渲染次数」+2 | 见下方「问题记录」的完整根因分析与修复 | ⚠️ 暴露了父子组件层级与 `<StrictMode>` 双重调用两个问题 |
| 拆分为平级兄弟组件并填好 S1（`summarySelector` + `isSameSummary`）后，点击选中未选节点 | `selectedIds` 变化，状态栏重渲染次数 +1 | 【源码事实 + 实测机制】`StoreAndHooksCanvas` 独立重渲染不波及兄弟组件；`StoreUpdater` 更新 store 后 `selectedIds` 变化，状态栏提交计数 +1 | `StoreAndHooksExercise.tsx:72-97` | ✅ |
| 填好 S1 后，按住已选中的节点来回拖动，或平移/缩放画布 | `nodeCount`、`edgeCount`、`selectedIds` 均未变，`isSameSummary` 返回 `true`，状态栏不重渲染 | 【源码事实】`isSameSummary` 拦截坐标与 `transform` 变化，且状态栏不是画布子组件，渲染次数保持不变 | `StoreAndHooksExercise.tsx:60-76` | ✅ |
| 点击「读取 Store 快照（S2）」，观察控制台日志与「状态栏渲染次数」 | 控制台打印 `viewport`、`nodeCount`、`nodeLookupIds`，状态栏渲染次数不变 | 【源码事实】`storeApi.getState()` 只做同步函数调用，不触发订阅更新 | `StoreAndHooksExercise.tsx:111-120` | ✅ |
| 点击「全选节点（S3-a）」与「新增节点（S3-b）」 | `reactFlow.setNodes` / `addNodes` 经 `BatchProvider` 触发 `onNodesChange`，画布与状态栏同步更新 | 【源码事实】`nodeQueue` 生成 `select` / `add` change 写回受控状态，再经 `StoreUpdater` 同步回 store | `StoreAndHooksExercise.tsx:122-141` | ✅ |

## 个人理解

1. **什么时候必须写 `<ReactFlowProvider>`**：只要在 `<ReactFlow>...</ReactFlow>` 标签**外面**（例如页面顶部工具栏、侧边属性面板、或者整个页面组件自身）需要调用 `useReactFlow`、`useStore`、`useStoreApi`、`useNodesData` 等 Hook，就必须在外层包上 `<ReactFlowProvider>`，让画布和外部面板共享同一个 `StoreContext`。
2. **`useStore`、`useStoreApi`、`useReactFlow` 怎么选**：
   - UI 需要跟着某个状态实时变（例如显示当前选中了几个节点、当前缩放倍率）→ 用 `useStore(selector, equalityFn)`，且 selector 粒度越细越好。
   - 只是在点击按钮或提交表单那一刻查一下当前有哪些节点、当前视口在哪 → 用 `useStoreApi().getState()`（或者 `useReactFlow().getNodes()`），零重渲染开销。
   - 需要命令式地增删改节点/边、调用 `fitView` / `setViewport` → 用 `useReactFlow()`。
3. **受控状态下订阅 Store 的组件为什么要和持有 `useNodesState` 的画布组件平级隔离**：如果把状态栏写成持有 `const [nodes] = useNodesState(...)` 的组件的直接子组件，那么每次节点位置更新都会通过 React 父子渲染链强行重渲染状态栏，让你精心写的 `useStore(selector, equalityFn)` 彻底失效。把画布状态封装在独立的 `<StoreAndHooksCanvas />` 子组件里，让状态栏 `<StoreInspectorBar />` 与它平级并列，才能真正发挥 Zustand 精细切片订阅的优势。

## 问题记录

### 为什么每选中一个 Node，状态栏会触发两次渲染？

在初始骨架上点击一个节点时，观察到状态栏计数器每次 **+2**（甚至在 `S1` 还没填写时也会 +2）。对照源码与 React 渲染机制，这里其实叠加了**两个原因**：

1. **原因一：React `<StrictMode>` 开发环境对组件渲染函数的双重调用**
   - 项目入口 `src/main.tsx:7-9` 包裹了 `<StrictMode>`。在开发模式下，React 为了检查渲染函数是否纯粹，每次组件更新都会把组件函数体执行 **2 遍**。
   - 初始骨架把 `renderCountRef.current += 1` 直接写在组件函数体顶层，因此哪怕只有 1 次状态提交（commit），函数体跑两遍就会让计数器 `+2`。
   - **修正**：在 `StoreInspectorBar` 中改用 `didRenderRef` 配合 `useEffect` 在每次真实提交（commit）后计数（`StoreAndHooksExercise.tsx:86-96`），排除 `<StrictMode>` 同一轮渲染的重复调用。

2. **原因二：父组件持有 `useNodesState` 引发的“父传子被动重渲染 + `StoreUpdater` 同步后主动重渲染”双重更新**
   - 初始骨架把 `<StoreInspectorBar />` 放在了持有 `const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)` 的 `StoreAndHooksCanvas` **内部当子组件**。
   - 在受控模式下，当你点击节点时，实际发生的是**两步异步接力**：
     1. **第 1 次重渲染（父组件带动）**：点击节点触发 `onNodesChange`，更新了父组件 `StoreAndHooksCanvas` 的 `nodes` state。父组件重渲染时，因为 `StoreInspectorBar` 是它的直接子组件，**无论 store 变没变，`StoreInspectorBar` 都会先跟着父组件被动重渲染第 1 次**（注意此时 `ReactFlow` 内部的 `StoreUpdater` 还没跑 `useEffect`，Zustand store 里的 `nodes` 还是旧的！）。
     2. **第 2 次重渲染（`StoreUpdater` 写入 store 触发）**：父组件本次渲染提交后，`ReactFlow` 内部的 `StoreUpdater`（`components/StoreUpdater/index.tsx:140-165`）在 `useEffect` 中检测到 `props.nodes !== previousFields.current.nodes`，调用 store 的 `setNodes(fieldValue)` 把新节点数组写进 Zustand store。此时 `useStore(summarySelector, isSameSummary)` 发现 `selectedIds` 变了，于是触发 `StoreInspectorBar` **第 2 次重渲染**！
   - 更严重的是：如果 `StoreInspectorBar` 留在 `StoreAndHooksCanvas` 内部当子组件，拖动节点时父组件的 `nodes` state 每帧都在变，`StoreInspectorBar` 也会跟着每帧被动重渲染，`useStore` 的 `equalityFn` 就形同虚设了。
   - **修正**：将 `StoreInspectorBar` 和持有 `useNodesState` 的 `StoreAndHooksCanvas` 拆成 `<ReactFlowProvider>` 下**真正的平级兄弟组件**（`StoreAndHooksExercise.tsx:161-196`）。这样画布更新 `nodes` state 时只重渲染 `StoreAndHooksCanvas` 自己，绝不会波及 `StoreInspectorBar`；只有当 `StoreUpdater` 把新状态同步进 store 且 `summarySelector` 切片确实改变时，`StoreInspectorBar` 才会干净地重渲染 **1 次**。

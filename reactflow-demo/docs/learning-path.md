# React Flow 学习路线

以 [官方 Learn 目录](https://reactflow.dev/learn) 为阅读主线。覆盖检查表按 2026-11-05 的官方侧栏核对；学习安排由本项目明确记录，不代表所有页面都需要立即练习。

## 每章怎么学

1. 打开页面“关联”区块中的“官方文档”链接，先阅读概念和示例。
2. 观察本章示例，再打开“练习文件”指向的源码。
3. 按动手任务修改代码，每次只改一个知识点，观察结果。
4. 对照预期现象验收，用自己的话解释数据和界面的关系。
5. 遇到“为什么”再追踪对应库源码；完成后进入下一章。

基础示例 01～03 保留在 lessons，侧栏显示为“入门” A1～A3；知识点显示为 T01～T08，目录与 hash 不变。T01、T02 的前置入门均为 A3，A3 的关联区块提供这两个知识点入口；T03 的前置是 T01、T02，T04 的前置是 T01、T03，T05 和 T08 的前置是 T01，其余未开始知识点的前置列表为空。侧栏仅显示编号与标题，知识点额外显示状态徽章；官方文档统一在页面关联区块列出，空数组不显示文档行。未开始的知识点只在侧栏灰色展示，不参与路由和翻页。侧栏切换或翻页会重新加载示例，因此临时画布编辑和视角会重置；对源码的修改保留在文件中。状态由注册表和根 README 显式记录，不自动认定你已学完。

## 已准备的入口

| 顺序 | 官方阅读 | 独立练习 | 重点 |
| --- | --- | --- | --- |
| A1 | [Quick Start](https://reactflow.dev/learn) | [QuickStartDemo.tsx](../src/lessons/01-quick-start/QuickStartDemo.tsx) | 运行并体验已有交互 Demo；含小地图和重置扩展 |
| A2 | [Overview](https://reactflow.dev/learn/concepts/terms-and-definitions) | [OverviewDemo.tsx](../src/lessons/02-overview/OverviewDemo.tsx) | 辨认节点、连接点、连线和视口 |
| A3 | [Building a Flow](https://reactflow.dev/learn/concepts/building-a-flow) | [BuildingFlowDemo.tsx](../src/lessons/03-building-a-flow/BuildingFlowDemo.tsx) | 从空画布到静态节点、连线 |
| T01 | [Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity)、[Uncontrolled Flow](https://reactflow.dev/learn/advanced-use/uncontrolled-flow) | [ControlledFlowExercise.tsx](../src/topics/01-controlled-flow/ControlledFlowExercise.tsx) | 受控流对照实现；Uncontrolled Flow 用于对照阅读，不表示新增非受控练习 |
| T02 | [Handles](https://reactflow.dev/learn/customization/handles)、[Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity) | [ConnectionExercise.tsx](../src/topics/02-connection/ConnectionExercise.tsx) | 连线与业务校验，R1–R5 与存边逻辑已实现 |
| T03 | [Nodes](https://reactflow.dev/learn/customization/custom-nodes)、[Utility Classes](https://reactflow.dev/learn/customization/utility-classes)、[TypeScript](https://reactflow.dev/learn/advanced-use/typescript) | [CustomNodesExercise.tsx](../src/topics/03-custom-nodes/CustomNodesExercise.tsx) | 自定义节点：注册 `nodeTypes`、`updateNodeData` 与 `nodrag` / `nowheel` / `nopan` 已实现 |
| T04 | [Hooks and Providers](https://reactflow.dev/learn/advanced-use/hooks-providers)、[State Management](https://reactflow.dev/learn/advanced-use/state-management) | [StoreAndHooksExercise.tsx](../src/topics/04-store-and-hooks/StoreAndHooksExercise.tsx) | Store 与 Hooks：`ReactFlowProvider`、`useStore` 切片订阅、`useStoreApi`、`useReactFlow` 已实现 |
| T05 | [The Viewport](https://reactflow.dev/learn/concepts/the-viewport) | [ViewportExercise.tsx](../src/topics/05-coordinates-and-viewport/ViewportExercise.tsx) | 坐标与视口骨架：屏幕坐标与流程坐标换算、交互方式切换、`fitView` / `setViewport`（V1–V4 待填写） |

具体任务、预期现象显示在页面上；基础示例登记在 [lessons 注册表](../src/lessons/index.ts)，知识点登记在 [topics 注册表](../src/topics/index.ts)。这些是可以开始练习的入口，不代表学习进度已完成；总进度见 [工作区 README](../../README.md)。页面按 hash 切换，可刷新直达及前进后退。

受控流知识点（`#topics/01-controlled-flow`）的两组实现都已接好状态更新：A 组把 changes 交给 `useNodesState` / `useEdgesState` 提供的 handler，B 组用 `applyNodeChanges` / `applyEdgeChanges` 写回 `useState`。对照控制台日志后，可以注释掉 handler 里的更新语句，自己重新写一遍再验证拖动、选中和边的删除。切换 A/B 会重新创建画布，不包含新建连线。

练习 1.5 在 B 组加了一条业务规则：`n1` 是流程入口，不允许删除。做法是在 changes 落到状态之前拒绝请求——`handleNodesChange` 丢掉 `n1` 的 `remove`，`handleEdgesChange` 丢掉与 `n1` 相连的边的 `remove`，节点批次再顺手清掉两端已不存在的边。实测现象：选中 `n1` 按 Delete 只出现一条 warn，节点和边都不动；选中 `n2` 删除则 `n2` 与 `n1-n2` 一起消失；与 `n1` 相连的边也因此不能单独删除——这是「只在自己这一批 change 里做判断」的代价，换用 `onBeforeDelete` 能让库把节点和边作为一整批交给你决定。阅读问题与源码对照记录见 [受控流笔记](../../notes/01-受控流.md)。

### Adding Interactivity 连线专题

侧栏“知识点 / 连线”对应 `#topics/02-connection`，代码位于 `src/topics/02-connection/`；不改变后续官方阅读顺序，也不覆盖受控流练习 1.5。

官方文档：[Handles](https://reactflow.dev/learn/customization/handles)、[Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity)。练习文件：[ConnectionExercise.tsx](../src/topics/02-connection/ConnectionExercise.tsx)、[connectionRules.ts](../src/topics/02-connection/connectionRules.ts)。

先观察拖线与控制台日志，再对照已填写的 R1–R5、C1/C2。合法连接放行，用 Start→A 验证正例，用 A→A、C→A、A 的另一输出点→B 验证反例。Start/End 不存在的端口用明确标记的候选数据探针补测，探针不等于真实拖线测试。功能边界、预测与实测记录见 [连线笔记](../../notes/02-连线.md)。等学习者提交 review 后再验收。

## 覆盖检查表

官方页面名称及分组来源：[React Flow Learn 侧栏](https://reactflow.dev/learn)，核对日期 2026-11-05。安排只有“对应知识点 / 需要时再学 / 暂不学”；“对应知识点”表示已登记阅读归属，不表示练习或验收完成。Overview、Building a Flow 由已有入门 A2、A3 承接，不另建重复知识点。

| 官方分组 | 官方页面 | 安排 | 对应条目 / 说明 |
| --- | --- | --- | --- |
| Core Concepts | Overview | 对应知识点 | 入门 A2 · Overview |
| Core Concepts | Building a Flow | 对应知识点 | 入门 A3 · Building a Flow |
| Core Concepts | Adding Interactivity | 对应知识点 | T01 · 受控流；T02 · 连线 |
| Core Concepts | The Viewport | 对应知识点 | T05 · 坐标与视口，前置 T01 |
| Core Concepts | Built-In Components | 需要时再学 | 使用内置辅助组件时阅读 |
| Customization | Nodes | 对应知识点 | T03 · 自定义节点，前置 T01、T02 |
| Customization | Handles | 对应知识点 | T02 · 连线 |
| Customization | Edges | 对应知识点 | T06 · 自定义边 |
| Customization | Edge Labels | 对应知识点 | T06 · 自定义边 |
| Customization | Utility Classes | 对应知识点 | T03 · 自定义节点，前置 T01、T02 |
| Customization | Theming | 需要时再学 | 调整主题时阅读 |
| Layouting | Overview | 需要时再学 | 有布局需求时阅读 |
| Layouting | Sub Flows | 需要时再学 | 有子流程需求时阅读 |
| Advanced Use | Hooks and Providers | 对应知识点 | T04 · Store 与 Hooks，前置 T01、T03 |
| Advanced Use | Accessibility | 暂不学 | — |
| Advanced Use | Testing | 暂不学 | — |
| Advanced Use | TypeScript | 对应知识点 | T03 · 自定义节点，前置 T01、T02 |
| Advanced Use | Uncontrolled Flow | 对应知识点 | T01 · 受控流（对照阅读） |
| Advanced Use | Performance | 对应知识点 | T07 · 性能 |
| Advanced Use | State Management | 对应知识点 | T04 · Store 与 Hooks，前置 T01、T03 |
| Advanced Use | Computing Flows | 对应知识点 | T08 · 节点间数据流，前置 T01 |
| Advanced Use | Server Side Rendering | 暂不学 | — |
| Advanced Use | Devtools | 暂不学 | — |
| Advanced Use | Multiplayer | 暂不学 | — |
| Advanced Use | Whiteboard Features | 暂不学 | — |

Tutorials 整组暂不学，逐页登记如下：

| 官方分组 | 官方页面 | 安排 |
| --- | --- | --- |
| Tutorials | Slideshow App | 暂不学 |
| Tutorials | Web Audio API | 暂不学 |
| Tutorials | Mind Map App | 暂不学 |
| Tutorials | React Flow UI | 暂不学 |

### 无官方文档的知识点登记

当前无。新增知识点的 `officialDocs` 为空时，在此登记编号与标题；补充官方文档后移入上方对应页面行。T01–T08 均已登记，不为未开始的计划创建练习目录或笔记。

Troubleshooting 的 Common Errors、Migrate to v12 / v11 / v10 遇到问题时按需查阅，不要求将项目降级练习。

## 新增知识点的约定

- 先读该章官方内容，明确本次练习范围。
- 在 `src/topics/NN-name/` 下新增独立目录及组件，保留 lessons 01～03，按项目 AGENTS.md 编写中文教学注释。
- 每个知识点目录创建 README，关联编号笔记、SOURCE_MAP 条目与练习内容。
- 在 `src/topics/index.ts` 登记 id、显示编号、标题、组件、笔记路径、状态、目标、练习任务、预期现象和功能边界；必须填写 `officialDocs: { title, url }[]` 与 `prerequisites`，两者均可为空数组。前置学习可引用入门或知识点的唯一 id；涉及入门时同步维护 `lessons/index.ts` 的 `deepensTopics`。仅登记未开始计划时无需创建组件、目录或笔记。
- 新增知识点必须同步登记本页覆盖检查表，包括未开始计划；文档数组为空时登记到“无官方文档的知识点登记”，页面不显示空文档行或占位文字。
- 创建 `notes/NN-知识点.md`，更新工作区根 README 的进度表，并检查相对链接与锚点。
- 保留之前章节的数据和交互，不通过修改上一章实现下一章。
- 同步更新本文件，执行 `pnpm lint` 和 `pnpm build`，在浏览器检查每个知识点及 hash 刷新、前进、后退。

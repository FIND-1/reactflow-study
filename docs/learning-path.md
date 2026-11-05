# React Flow 学习路线

以 [官方 Learn 目录](https://reactflow.dev/learn) 为阅读主线。以下顺序核对于 2026-11-04；后续官网调整时以官网为准。

## 每章怎么学

1. 打开页面中的“阅读官方章节”，先阅读概念和示例。
2. 观察本章示例，再打开“练习文件”指向的源码。
3. 按动手任务修改代码，每次只改一个知识点，观察结果。
4. 对照预期现象验收，用自己的话解释数据和界面的关系。
5. 遇到“为什么”再追踪对应库源码；完成后进入下一章。

基础示例 01～03 保留在 lessons，后续知识点分别放入 topics 并对应编号笔记。侧栏切换或翻页会重新加载示例，因此临时画布编辑和视角会重置；对源码的修改保留在文件中。状态由注册表和根 README 显式记录，不自动认定你已学完。

## 已准备的入口

| 顺序 | 官方阅读 | 独立练习 | 重点 |
| --- | --- | --- | --- |
| 01 | [Quick Start](https://reactflow.dev/learn) | [QuickStartDemo.tsx](../src/lessons/01-quick-start/QuickStartDemo.tsx) | 运行并体验已有交互 Demo；含小地图和重置扩展 |
| 02 | [Core Concepts / Overview](https://reactflow.dev/learn/concepts/terms-and-definitions) | [OverviewDemo.tsx](../src/lessons/02-overview/OverviewDemo.tsx) | 辨认节点、连接点、连线和视口 |
| 03 | [Building a Flow](https://reactflow.dev/learn/concepts/building-a-flow) | [BuildingFlowDemo.tsx](../src/lessons/03-building-a-flow/BuildingFlowDemo.tsx) | 从空画布到静态节点、连线 |
| 知识点 01 | [Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity) | [ControlledFlowExercise.tsx](../src/topics/01-controlled-flow/ControlledFlowExercise.tsx) | 受控流对照实现：changes 日志、Hook handler 与手写 handler；B 组练习 1.5 锁定 n1 |
| 知识点 02 | [Handling connections](https://reactflow.dev/learn/concepts/adding-interactivity#handling-connections) | [ConnectionExercise.tsx](../src/topics/02-connection/ConnectionExercise.tsx) | 连线与业务校验骨架，关键逻辑留作 TODO |

具体任务、预期现象显示在页面上；基础示例登记在 [lessons 注册表](../src/lessons/index.ts)，知识点登记在 [topics 注册表](../src/topics/index.ts)。这些是可以开始练习的入口，不代表学习进度已完成；总进度见 [工作区 README](../../README.md)。页面按 hash 切换，可刷新直达及前进后退。

受控流知识点（`#topics/01-controlled-flow`）的两组实现都已接好状态更新：A 组把 changes 交给 `useNodesState` / `useEdgesState` 提供的 handler，B 组用 `applyNodeChanges` / `applyEdgeChanges` 写回 `useState`。对照控制台日志后，可以注释掉 handler 里的更新语句，自己重新写一遍再验证拖动、选中和边的删除。切换 A/B 会重新创建画布，不包含新建连线。

练习 1.5 在 B 组加了一条业务规则：`n1` 是流程入口，不允许删除。做法是在 changes 落到状态之前拒绝请求——`handleNodesChange` 丢掉 `n1` 的 `remove`，`handleEdgesChange` 丢掉与 `n1` 相连的边的 `remove`，节点批次再顺手清掉两端已不存在的边。实测现象：选中 `n1` 按 Delete 只出现一条 warn，节点和边都不动；选中 `n2` 删除则 `n2` 与 `n1-n2` 一起消失；与 `n1` 相连的边也因此不能单独删除——这是「只在自己这一批 change 里做判断」的代价，换用 `onBeforeDelete` 能让库把节点和边作为一整批交给你决定。阅读问题与源码对照记录见 [受控流笔记](../../notes/01-受控流.md)。

### Adding Interactivity 连线专题（练习骨架）

侧栏“知识点 / 连线”对应 `#topics/02-connection`，代码位于 `src/topics/02-connection/`；不改变后续官方阅读顺序，也不覆盖受控流练习 1.5。

官方阅读：[Handling connections](https://reactflow.dev/learn/concepts/adding-interactivity#handling-connections)，按需补读 [Handles](https://reactflow.dev/learn/customization/handles)。练习文件：[ConnectionExercise.tsx](../src/topics/02-connection/ConnectionExercise.tsx)、[connectionRules.ts](../src/topics/02-connection/connectionRules.ts)。

先观察拖线与控制台日志，再自行填写 R1–R5、C1/C2。所有规则当前返回 pending，拒绝新连接；完成后用 Start→A 验证正例，用 A→A、C→A、A 的另一输出点→B 验证反例。Start/End 不存在的端口用明确标记的候选数据探针补测，探针不等于真实拖线测试。功能边界、预测与实测记录见 [连线笔记](../../notes/02-连线.md)。只有你说“我写完了”之后才 review。

## 后续阅读顺序

以下章节暂未建立练习，读到时按知识点在 topics 中添加。

### Core Concepts（继续）

5. [The Viewport](https://reactflow.dev/learn/concepts/the-viewport)：练习观察范围、平移和缩放。
6. [Built-In Components](https://reactflow.dev/learn/concepts/built-in-components)：逐项体验内置辅助组件。

### Customization

Nodes → Handles → Edges → Edge Labels → Utility Classes → Theming。

### Layouting

Overview → Sub Flows。

### Advanced Use

Hooks and Providers → Accessibility → Testing → TypeScript → Uncontrolled Flow → Performance → State Management → Computing Flows → Server Side Rendering → Devtools → Multiplayer → Whiteboard Features。

### Tutorials

Slideshow App → Web Audio API → Mind Map App → React Flow UI。

### Troubleshooting

Common Errors → Migrate to v12 → Migrate to v11 → Migrate to v10。

排错内容遇到问题时也可提前查阅；迁移章节用于了解历史版本差异，不要求把当前项目降级来练习。

## 新增知识点的约定

- 先读该章官方内容，明确本次练习范围。
- 在 `src/topics/NN-name/` 下新增独立目录及组件，保留 lessons 01～03，按项目 AGENTS.md 编写中文教学注释。
- 每个知识点目录创建 README，关联编号笔记、SOURCE_MAP 条目与练习内容。
- 在 `src/topics/index.ts` 登记 id、标题、组件、笔记路径、状态、官方链接、目标、练习任务、预期现象和功能边界。
- 创建 `notes/NN-知识点.md`，更新工作区根 README 的进度表，并检查相对链接与锚点。
- 保留之前章节的数据和交互，不通过修改上一章实现下一章。
- 同步更新本文件，执行 `pnpm lint` 和 `pnpm build`，在浏览器检查每个知识点及 hash 刷新、前进、后退。

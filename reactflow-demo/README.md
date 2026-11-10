# React Flow 学习与练习

按 [官方 Learn](https://reactflow.dev/learn) 顺序逐章学习的 Vite + React + TypeScript 项目，使用 pnpm。

本目录是 [reactflow-study](https://github.com/FIND-1/reactflow-study) 仓库中的 demo，可在此目录安装并运行。父目录的工作区 README、`notes/` 和 `SOURCE_MAP.md` 随主仓库一起提交；上游 `xyflow/` 不上传，需要阅读源码时按 [工作区 README](../README.md#复原-xyflow-源码) 复原。

## 运行

使用 Node.js 22.12+（当前验证版本 22.22.3）和 pnpm 11.7.0。

```sh
pnpm install
pnpm dev
```

打开终端中的本地地址，通过侧栏或上一页 / 下一页切换练习。每页提供关联区块、学习目标、源码位置、动手任务和预期现象；关联区块从注册表的 `officialDocs` 展示全部官方文档链接，空数组不显示这一行。知识点额外显示笔记路径。侧栏只显示“编号 · 标题”：入门 A1–A3 不显示状态徽章，知识点 T01–T08 在右侧显示状态；未开始知识点灰色且不可点击。

知识点使用 `#topics/01-controlled-flow`、`#topics/02-connection`、`#topics/03-custom-nodes`、`#topics/05-coordinates-and-viewport`，基础示例使用 `#lessons/quick-start`、`#lessons/overview`、`#lessons/building-a-flow`。刷新和浏览器前进/后退跟随 hash；空 hash 或无效 hash 显示受控流。目录总览、学习进度与上游源码复原方法见 [工作区 README](../README.md)。

```sh
pnpm lint     # 代码检查
pnpm build    # TypeScript 检查及生产构建
pnpm preview  # 预览构建结果
```

## 基础示例与知识点

| 顺序 | 章节 | 内容 |
| --- | --- | --- |
| A1 | Quick Start | 骨架已准备；保留原有综合 Demo：拖拽、连线、删除、背景、控制栏、小地图和重置 |
| A2 | Overview | 骨架已准备；图示辨认节点、连接点、连线和视口 |
| A3 | Building a Flow | 骨架已准备；从静态数据搭建节点、连线，调整位置、文字和线形；之后深入 T01、T02 |
| T01 | [受控流](src/topics/01-controlled-flow/README.md) | 笔记完成；两种 handler 对照，手写组还锁定了一个不可删除的节点；收尾项完成前不标已验收 |
| T02 | [连线](src/topics/02-connection/README.md) | 笔记完成；Handle、R1–R5 校验与受控存边已实现，待 review 验收 |
| T03 | [自定义节点](src/topics/03-custom-nodes/README.md) | 骨架已准备；自定义节点注册、内部控件 `updateNodeData` 与 `nodrag` / `nowheel` / `nopan`（N1–N3 待填写） |
| T05 | [坐标与视口](src/topics/05-coordinates-and-viewport/README.md) | 骨架已准备；屏幕坐标与流程坐标换算、交互方式切换、`fitView` / `setViewport`（V1–V4 待填写） |

T04、T06–T08 为尚未开始的计划条目；T08“节点间数据流”以前置 T01“受控流”衔接 Computing Flows，暂不创建页面、练习目录或笔记。完整进度见[工作区 README](../README.md)，官方页面安排见[覆盖检查表](docs/learning-path.md#覆盖检查表)。

Building a Flow 只练习静态图；受控流知识点提供两种已可运行的写法：A 组使用 `useNodesState` / `useEdgesState` 提供的 handler，B 组用 `applyNodeChanges` / `applyEdgeChanges` 自己更新状态。打开“知识点 / 受控流”和浏览器控制台对照日志；想自己重练，把 handler 里的更新语句注释掉再写一遍。官方文档映射见 [学习路线](docs/learning-path.md)。

B 组的练习 1.5 把 `n1` 设成不可删除的流程入口：`handleNodesChange` 丢掉 `n1` 的 `remove`，`handleEdgesChange` 丢掉与 `n1` 相连的边的 `remove`，节点批次再清掉两端已不存在的边。因此「选中 n1 按 Delete」只会在控制台留一条 warn，选中 `n2` 删除则 `n2` 和 `n1-n2` 一起消失；与 `n1` 相连的边也随之不能单独删除。这一处行为按设计只存在于 B 组，方便和 A 组对照。

## 代码入口

连线和受控流现在分别位于 `src/topics/02-connection/` 与 `src/topics/01-controlled-flow/`，阅读主线仍对应 Adding Interactivity：

- [ConnectionExercise.tsx](src/topics/02-connection/ConnectionExercise.tsx)：Start 只有输出、End 只有输入，临时连线与日志已接好；C1/C2 通过 `addEdge` 将合法连接写回 edges。
- [connectionRules.ts](src/topics/02-connection/connectionRules.ts)：R1–R5 已实现 End 禁止输出、Start 禁止输入、自连、有向环和重复节点对校验。
- [连线笔记](../notes/02-连线.md)：包含阅读问题、“预测 vs 实际”、个人理解、补答和问题记录；新增无 id 多出口实验与前后端职责说明。

当前五条规则全部通过才允许创建新边；任一拒绝都会阻止该候选。每次进入业务校验会生成逐条规则结果，相同候选与结果的控制台日志会去重；Start/End 拖线时显示结构提示。数据探针可补测 End→A、A→Start 等正常端口布局无法产生的候选，它们不经过库内校验、不创建边。初始 A→B→C 用于环和重复边练习；重复按有向 source→target 判断，不区分 Handle。规则属于本练习约定，不自动适用于允许分支汇合或循环的工作流产品；review 通过前保持“笔记完成”。

- [src/App.tsx](src/App.tsx)：hash 导航、学习指引和翻页。
- [src/topics/index.ts](src/topics/index.ts)：知识点 id、标题、组件、笔记路径、状态与练习任务登记。
- [src/lessons/index.ts](src/lessons/index.ts)：01～03 基础示例的顺序、官方链接与组件登记。
- [QuickStartDemo.tsx](src/lessons/01-quick-start/QuickStartDemo.tsx)：原有交互 Demo 与中文注释。
- [OverviewDemo.tsx](src/lessons/02-overview/OverviewDemo.tsx)：概念图示。
- [BuildingFlowDemo.tsx](src/lessons/03-building-a-flow/BuildingFlowDemo.tsx)：静态流程练习。
- [ControlledFlowExercise.tsx](src/topics/01-controlled-flow/ControlledFlowExercise.tsx)：受控流两种写法的对照实现（先打印 changes，再更新状态），含练习 1.5 的「n1 不可删除」。
- [受控流笔记](../notes/01-受控流.md)：源码阅读问题、changes 数据流梳理与对照记录。
- [CustomNodesExercise.tsx](src/topics/03-custom-nodes/CustomNodesExercise.tsx)：自定义节点骨架，保留 N1–N3（工具类名、`updateNodeData`、`nodeTypes` 注册）待填写。
- [自定义节点笔记](../notes/03-自定义节点.md)：`NodeWrapper`、工具类名过滤与 `updateNodeData` 阅读指引及预测记录表。
- [ViewportExercise.tsx](src/topics/05-coordinates-and-viewport/ViewportExercise.tsx)：坐标与视口骨架，保留 V1–V4（设计工具式交互、坐标换算、点击放置节点、视口控制）待填写。
- [坐标与视口笔记](../notes/05-坐标与视口.md)：`useViewportHelper`、坐标换算公式与 `XYPanZoom` 阅读指引及预测记录表。
- [src/index.css](src/index.css)：React Flow 必需样式和全局样式。
- [src/App.css](src/App.css)：学习页面与画布容器样式。
- [AGENTS.md](AGENTS.md)：逐章练习及可读注释规范。

## 状态与功能边界

每章独立管理数据。切换章节或刷新页面后，画布操作和视角重置；修改源码会保留在文件中。页面不保存学习进度，也不会把“示例已准备”视为“用户已完成”。

受控流练习切换 A/B 时也会重置画布；不包含新建连线。B 组还锁定了 `n1`（练习 1.5），切回 A 组即可恢复「随便删」的对照；想自己重练时，把 handler 里的更新语句注释掉即可。

Quick Start 的“重置流程”只恢复节点和连线；视角可通过控制栏的适应视图按钮恢复。窄屏隐藏小地图以保留操作空间。节点仅展示图形与文字，不执行真实业务。

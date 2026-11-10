# React Flow 学习工作区

这里按知识点组织笔记、源码入口与练习；实现已准备不等于学习已完成。

## 学习进度

| 知识点 | 笔记链接 | demo 链接 | 官方文档 | 前置学习 | 状态 |
| --- | --- | --- | --- | --- | --- |
| T01 · 受控流 | [01-受控流.md](notes/01-受控流.md) | [01-controlled-flow](reactflow-demo/src/topics/01-controlled-flow/README.md) | [Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity)、[Uncontrolled Flow](https://reactflow.dev/learn/advanced-use/uncontrolled-flow) | A3 · Building a Flow | 笔记完成 |
| T02 · 连线 | [02-连线.md](notes/02-连线.md) | [02-connection](reactflow-demo/src/topics/02-connection/README.md) | [Handles](https://reactflow.dev/learn/customization/handles)、[Adding Interactivity](https://reactflow.dev/learn/concepts/adding-interactivity) | A3 · Building a Flow | 笔记完成 |
| T03 · 自定义节点 | [03-自定义节点.md](notes/03-自定义节点.md) | [03-custom-nodes](reactflow-demo/src/topics/03-custom-nodes/README.md) | [Nodes](https://reactflow.dev/learn/customization/custom-nodes)、[Utility Classes](https://reactflow.dev/learn/customization/utility-classes)、[TypeScript](https://reactflow.dev/learn/advanced-use/typescript) | T01 · 受控流；T02 · 连线 | 笔记完成 |
| T04 · Store 与 Hooks | — | — | [Hooks and Providers](https://reactflow.dev/learn/advanced-use/hooks-providers)、[State Management](https://reactflow.dev/learn/advanced-use/state-management) | — | 未开始 |
| T05 · 坐标与视口 | [05-坐标与视口.md](notes/05-坐标与视口.md) | [05-coordinates-and-viewport](reactflow-demo/src/topics/05-coordinates-and-viewport/README.md) | [The Viewport](https://reactflow.dev/learn/concepts/the-viewport) | T01 · 受控流 | 骨架已准备 |
| T06 · 自定义边 | — | — | [Edges](https://reactflow.dev/learn/customization/custom-edges)、[Edge Labels](https://reactflow.dev/learn/customization/edge-labels) | — | 未开始 |
| T07 · 性能 | — | — | [Performance](https://reactflow.dev/learn/advanced-use/performance) | — | 未开始 |
| T08 · 节点间数据流 | — | — | [Computing Flows](https://reactflow.dev/learn/advanced-use/computing-flows) | T01 · 受控流 | 未开始 |

状态统一使用：未开始 / 骨架已准备 / 实现中 / 笔记完成 / 已验收。T01 收尾项完成前保持“笔记完成”。未开始知识点只在侧栏灰色展示，暂不可点击，也不创建对应目录或笔记；后续笔记沿用预留编号。

## 目录与入口

- [notes/](notes/)：编号笔记，个人理解和实验结果由学习者填写。
- [SOURCE_MAP.md](SOURCE_MAP.md)：与 `@xyflow/react@12.12.1` 对应的真实源码入口。
- [reactflow-demo/README.md](reactflow-demo/README.md)：运行方法及功能边界。
- [知识点注册表](reactflow-demo/src/topics/index.ts)：统一登记 id、显示编号、标题、官方文档列表、前置学习、组件、笔记路径、状态与练习指引。
- [入门示例注册表](reactflow-demo/src/lessons/index.ts)：显示 A1 Quick Start、A2 Overview、A3 Building a Flow，侧栏不显示状态徽章，原目录和 hash 不变；A3 关联 T01、T02，其余深入知识点列表为空。
- [学习路线与覆盖检查表](reactflow-demo/docs/learning-path.md#覆盖检查表)：官方 Learn 页面的对应知识点及学习安排。
- `xyflow/`：只读上游源码，不安装依赖、不构建；由根 `.gitignore` 排除。

## 运行与页面地址

在当前目录执行：

```sh
cd reactflow-demo
pnpm install
pnpm dev
```

使用终端输出的本地地址，再附加以下 hash；不依赖路由库或服务器路径重写。

| 页面 | hash |
| --- | --- |
| 受控流 | `#topics/01-controlled-flow` |
| 连线 | `#topics/02-connection` |
| 自定义节点 | `#topics/03-custom-nodes` |
| 坐标与视口 | `#topics/05-coordinates-and-viewport` |
| Quick Start | `#lessons/quick-start` |
| Overview | `#lessons/overview` |
| Building a Flow | `#lessons/building-a-flow` |

刷新与浏览器前进/后退跟随 hash。空 hash 或未知 hash 显示受控流页面；切换到不同页面会重新创建画布，画布编辑不持久保存。

## 复原 xyflow 源码

在 `reactflow-study` 根目录、尚不存在 `xyflow/` 时执行：

```sh
git clone https://github.com/xyflow/xyflow.git
cd xyflow
git checkout @xyflow/react@12.12.1
```

`xyflow/` 已存在时无需重新克隆。本学习工作区仅阅读此版本源码，不在其中执行 `pnpm install` 或编辑文件。

## 仓库状态与新增知识点

整个 `reactflow-study` 是一个 Git 仓库，公开远程仓库为 [FIND-1/reactflow-study](https://github.com/FIND-1/reactflow-study)。在根目录和 `reactflow-demo` 中执行 `git rev-parse --show-toplevel`，均指向 `reactflow-study`；demo 是主仓库内的普通目录。

主仓库包含笔记、源码地图和 demo，忽略 `xyflow/`、各级 `node_modules/`、`dist/` 及本地环境文件。`xyflow` 保持独立的上游克隆，不作为子模块或源码副本提交；需要阅读源码时按上节复原。

新增知识点时，在 `reactflow-demo/src/topics/NN-name/` 创建练习与 README，在 `src/topics/index.ts` 注册，创建对应 `notes/NN-知识点.md`，并更新本页进度表和学习路线的覆盖检查表。`officialDocs` 可为空数组，`prerequisites` 可引用入门或知识点 id；仅登记“未开始”计划时无需创建练习与笔记目录。详细约定见 [AGENTS.md](reactflow-demo/AGENTS.md)。

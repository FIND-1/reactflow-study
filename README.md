# React Flow 学习工作区

这里按知识点组织笔记、源码入口与练习；实现已准备不等于学习已完成。

## 学习进度

| 知识点 | 笔记链接 | demo 链接 | 状态 |
| --- | --- | --- | --- |
| 01 · 受控流 | [01-受控流.md](notes/01-受控流.md) | [01-controlled-flow](reactflow-demo/src/topics/01-controlled-flow/README.md) | 已实现，待学习验收 |
| 02 · 连线 | [02-连线.md](notes/02-连线.md) | [02-connection](reactflow-demo/src/topics/02-connection/README.md) | 骨架已准备，待实现 |
| 自定义节点 | — | — | 未开始 |
| Store 与 Hooks | — | — | 未开始 |
| 坐标与视口 | — | — | 未开始 |
| 自定义边 | — | — | 未开始 |
| 性能 | — | — | 未开始 |

## 目录与入口

- [notes/](notes/)：编号笔记，个人理解和实验结果由学习者填写。
- [SOURCE_MAP.md](SOURCE_MAP.md)：与 `@xyflow/react@12.12.1` 对应的真实源码入口。
- [reactflow-demo/README.md](reactflow-demo/README.md)：运行方法及功能边界。
- [知识点注册表](reactflow-demo/src/topics/index.ts)：统一登记 id、标题、组件、笔记路径、状态与练习指引。
- [基础示例注册表](reactflow-demo/src/lessons/index.ts)：保留 01 Quick Start、02 Overview、03 Building a Flow。
- [学习路线](reactflow-demo/docs/learning-path.md)：知识点与官方章节的对应关系。
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

新增知识点时，在 `reactflow-demo/src/topics/NN-name/` 创建练习与 README，在 `src/topics/index.ts` 注册，创建对应 `notes/NN-知识点.md`，并更新本页进度表。详细约定见 [AGENTS.md](reactflow-demo/AGENTS.md)。

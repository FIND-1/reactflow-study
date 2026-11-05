import { Background, Controls, ReactFlow, type Node, type Edge } from '@xyflow/react'

// 第一步：下方 ReactFlow 配合 Background / Controls 就能显示空画布。
// 必需样式统一在 src/index.css 导入，容器宽高由 src/App.css 提供。

// 第二步：为画布提供节点。id 必须唯一；position 决定位置，data.label 决定文字。
// input 只有输出连接点，output 只有输入连接点，适合演示一条从上到下的流程。
const initialNodes: Node[] = [
  { id: 'n1', type: 'input', position: { x: 0, y: 0 }, data: { label: '节点 1 · 输入' } },
  { id: 'n2', type: 'output', position: { x: 100, y: 160 }, data: { label: '节点 2 · 输出' } },
]

// 第三步：source / target 对应节点 id，建立两个节点之间的连线。
// 第四步：label 给连线加说明，type 决定线形；试着把 smoothstep 改成 straight。
const initialEdges: Edge[] = [
  { id: 'n1-n2', source: 'n1', target: 'n2', type: 'smoothstep', label: '连接到' },
]

export default function BuildingFlowDemo() {
  return (
    <section className="app">
      <header>
        <p className="eyebrow">CORE CONCEPTS / BUILDING A FLOW</p>
        <h1>从数据搭建一个流程</h1>
        <p className="description">先理解节点和连线的数据结构，再学习如何响应用户操作。</p>
      </header>
      <section className="flow-container" aria-label="静态流程搭建练习">
        {/* 本章传入固定数组，没有状态更新回调。显式关闭编辑操作，避免误以为拖拽失效。
            fitView 仅帮助初次展示；画布平移和缩放由 React Flow 自己管理，仍可使用。 */}
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <p className="app-footer">本章验收：能通过修改节点和连线数据改变图形，并解释 source / target 与节点 id 的关系。</p>
    </section>
  )
}

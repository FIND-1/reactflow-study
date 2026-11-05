import { Background, Controls, ReactFlow, type Node, type Edge } from '@xyflow/react'

// 这张图用来辨认术语。节点是画布中的元素，id 用来让连线准确找到它。
const nodes: Node[] = [
  { id: 'source', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Node · 源节点' } },
  { id: 'target', type: 'output', position: { x: 140, y: 160 }, data: { label: 'Node · 目标节点' } },
]

// Edge 表达节点之间的关系；内置节点边缘的小圆点就是 Handle（连接点）。
const edges: Edge[] = [
  { id: 'source-target', source: 'source', target: 'target', label: 'Edge · 连线' },
]

export default function OverviewDemo() {
  return (
    <section className="app">
      <header>
        <p className="eyebrow">CORE CONCEPTS / OVERVIEW</p>
        <h1>认识流程图的组成</h1>
        <p className="description">试着平移或缩放：视口变化时，节点自身的画布坐标并没有改变。</p>
      </header>
      <section className="flow-container" aria-label="流程图概念图示">
        {/* 固定节点方便认概念；视口仍允许平移、缩放。交互练习在 Quick Start 中进行。 */}
        <ReactFlow nodes={nodes} edges={edges} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} fitView>
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <dl className="concept-list">
        <div><dt>Selection · 选中</dt><dd>点击选中元素，按住 Shift 拖动可以框选多个元素。</dd></div>
        <div><dt>Connection line · 临时连接线</dt><dd>从连接点拖出、尚未完成连接时显示的预览线。</dd></div>
        <div><dt>Viewport · 视口</dt><dd>观察画布的窗口；平移和缩放改变显示范围。</dd></div>
      </dl>
    </section>
  )
}

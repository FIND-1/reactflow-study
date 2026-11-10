import { useCallback, useState, type ChangeEvent } from 'react'
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnNodesChange,
} from '@xyflow/react'
import './custom-nodes.css'

// TypeScript：第二个泛型参数固定节点的 type 字面量（'inspectorCard'），
// 这样 NodeProps<InspectorCardNode> 里的 data、type 都会有准确的类型推断。
export type InspectorCardData = {
  title: string
  stepCount: number
  notes: string[]
}
export type InspectorCardNode = Node<InspectorCardData, 'inspectorCard'>

// 故意保留一个内置 default 节点与两个自定义节点同场对照：
// NodeWrapper 会按 node.type 先查我们传入的 nodeTypes，查不到再回退到 builtinNodeTypes。
const initialNodes: (InspectorCardNode | Node<{ label: string }>)[] = [
  {
    id: 'entry',
    type: 'default',
    position: { x: 0, y: 110 },
    data: { label: '内置 default 节点（对照）' },
  },
  {
    id: 'card-a',
    type: 'inspectorCard',
    position: { x: 250, y: 20 },
    data: {
      title: '数据清洗',
      stepCount: 2,
      notes: [
        '1. 拖动标题或卡片空白处，整个节点应该移动',
        '2. 拖拉下面的滑块时，节点不应该跟着跑（nodrag）',
        '3. 在这个滚动框里滚轮，画布不应该缩放（nowheel）',
        '4. 选中文字或复制内容时，画布不应该平移（nopan）',
        '5. 观察控制台：updateNodeData 会触发 replace 类型的 change',
      ],
    },
  },
  {
    id: 'card-b',
    type: 'inspectorCard',
    position: { x: 600, y: 80 },
    data: {
      title: '汇总输出',
      stepCount: 5,
      notes: [
        '点击卡片切换 selected 状态，观察外框高亮',
        '拖动节点时 dragging 为 true，松手后恢复 false',
        '补充：可继续滚动检查 nowheel 是否拦截了 wheel 事件',
        '第 4 行日志示例：用于撑开滚动容器高度',
      ],
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'entry-a', source: 'entry', target: 'card-a' },
  { id: 'a-b', source: 'card-a', target: 'card-b' },
]

// TODO N1：填写 React Flow 默认识别的三个工具类名（见官方 Utility Classes 与 ReactFlow/index.tsx:121-123）。
// 未填写前为空字符串，滑块拖动会带动整个节点移动，在日志框里滚轮会缩放整张画布。
const UTILITY_CLASSES = {
  // 阻止从控件启动节点拖动（XYDrag.ts:408 的 filter 检查）
  noDrag: '',
  // 阻止在滚动容器内触发画布滚轮缩放或滚轮平移（filter.ts:65、eventhandler.ts:74）
  noWheel: '',
  // 阻止在可交互区域内按下拖动时触发画布平移（filter.ts:71）
  noPan: '',
}

function InspectorCardNodeComponent({
  id,
  data,
  selected,
  dragging,
  isConnectable,
}: NodeProps<InspectorCardNode>) {
  // useReactFlow 不仅能操作视口，还提供 updateNodeData：
  // 内部把新旧节点对比成 { type: 'replace', id, item } 交给 onNodesChange（BatchProvider/index.tsx:50）。
  const { updateNodeData } = useReactFlow<InspectorCardNode>()

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value
    // TODO N2-a：调用 updateNodeData(id, { title: nextTitle }) 把新标题写回节点 data。
    void updateNodeData
    console.info('[自定义节点 / 输入] TODO N2-a 尚未实现：updateNodeData 更新 title', { id, nextTitle })
  }

  const handleStepChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextStepCount = Number(event.target.value)
    // TODO N2-b：调用 updateNodeData(id, { stepCount: nextStepCount }) 把滑块数值写回节点 data。
    console.info('[自定义节点 / 滑块] TODO N2-b 尚未实现：updateNodeData 更新 stepCount', { id, nextStepCount })
  }

  return (
    <div
      className="inspector-card-node"
      data-selected={selected}
      data-dragging={dragging}
    >
      {/* 自定义节点不会自动生成连接点，必须显式渲染 Handle 才能连线。 */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="inspector-card-header">
        <strong>{data.title}</strong>
        <span className="inspector-card-badges">
          <code>id: {id}</code>
          <span>{selected ? '已选中' : '未选中'}</span>
          {dragging && <span>拖动中</span>}
        </span>
      </div>

      <label className="inspector-card-field">
        <span>标题（输入 / 拖选文字）：</span>
        <input
          type="text"
          className={[UTILITY_CLASSES.noDrag, UTILITY_CLASSES.noPan].filter(Boolean).join(' ')}
          value={data.title}
          onChange={handleTitleChange}
        />
      </label>

      <label className="inspector-card-field">
        <span>步数滑块（当前：{data.stepCount}）：</span>
        <input
          type="range"
          min={1}
          max={10}
          className={UTILITY_CLASSES.noDrag}
          value={data.stepCount}
          onChange={handleStepChange}
        />
      </label>

      <div className="inspector-card-field">
        <span>可滚动备注（在此处滚动滚轮）：</span>
        <ul
          className={['inspector-card-notes', UTILITY_CLASSES.noWheel, UTILITY_CLASSES.noDrag]
            .filter(Boolean)
            .join(' ')}
        >
          {data.notes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  )
}

// nodeTypes 必须定义在组件外部（或用 useMemo 缓存）：
// 如果每次渲染都创建新对象，NodeWrapper 会认为节点组件类型变了，导致自定义节点反复卸载重建、输入框丢焦点。
// TODO N3：把 inspectorCard 映射到上面的 InspectorCardNodeComponent。
// 未注册前，NodeWrapper 查不到该类型，会触发 003 告警并回退成默认节点（NodeWrapper/index.tsx:56-62）。
void InspectorCardNodeComponent
const nodeTypes = {} satisfies NodeTypes

export default function CustomNodesExercise() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [missingTypeWarning, setMissingTypeWarning] = useState<string | null>(null)

  const handleNodesChange = useCallback<OnNodesChange<(typeof initialNodes)[number]>>(
    (changes) => {
      // 观察点：拖动滑块或修改输入框调用 updateNodeData 时，这里会收到 type === 'replace' 的 change。
      console.log('[自定义节点 / onNodesChange]', changes)
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  return (
    <section className="app custom-nodes-exercise">
      <header>
        <p className="eyebrow">CUSTOMIZATION / CUSTOM NODES & UTILITY CLASSES</p>
        <h1>自定义节点：注册 nodeTypes、内部控件更新与工具类名</h1>
        <p className="description">自定义节点就是普通 React 组件，通过 NodeProps 拿到 id、data、selected、dragging，并在内部放 Handle 和表单控件。在文件顶部的静态 nodeTypes 中注册组件（N3），补齐 nodrag / nowheel / nopan（N1）与 updateNodeData（N2）。</p>
      </header>
      <div className="header-actions">
        <button
          type="button"
          onClick={() => {
            setNodes(initialNodes)
            setMissingTypeWarning(null)
          }}
        >
          恢复初始节点
        </button>
        {missingTypeWarning && (
          <span className="custom-nodes-warning" role="status">
            库告警：{missingTypeWarning}（请完成 TODO N3 注册 nodeTypes）
          </span>
        )}
      </div>
      <section className="flow-container" aria-label="自定义节点练习">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onError={(code, message) => {
            console.warn(`[自定义节点 / onError ${code}]`, message)
            if (code === '003') setMissingTypeWarning(message)
          }}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </section>
      <p className="app-footer">nodeTypes 定义在组件外部，避免重渲染时节点卸载重建导致输入框失焦。未完成 N3 时，inspectorCard 节点会回退成无标签的默认方框并触发 003 告警；未完成 N1 时，拖滑块会拖动节点、在备注框滚轮会缩放画布。切换章节或刷新会恢复初始状态。</p>
    </section>
  )
}

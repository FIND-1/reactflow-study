import { useEffect, useRef } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
  useStoreApi,
  type Edge,
  type Node,
  type ReactFlowState,
} from '@xyflow/react'
import './store-and-hooks.css'

const defaultEdgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } }

const initialNodes: Node<{ label: string }>[] = [
  {
    id: 'n1',
    type: 'input',
    position: { x: 0, y: 40 },
    sourcePosition: Position.Right,
    data: { label: 'N1 · 入口' },
  },
  {
    id: 'n2',
    position: { x: 240, y: 40 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { label: 'N2 · 处理（试着拖动或选中我）' },
  },
  {
    id: 'n3',
    type: 'output',
    position: { x: 520, y: 40 },
    targetPosition: Position.Left,
    data: { label: 'N3 · 输出' },
  },
]

const initialEdges: Edge[] = [
  { id: 'n1-n2', source: 'n1', target: 'n2' },
  { id: 'n2-n3', source: 'n2', target: 'n3' },
]

type StoreSummary = {
  nodeCount: number
  edgeCount: number
  selectedIds: string[]
}

// 比较两次 selector 结果是否相等（对应 useStore 的第二个参数 equalityFn，见 hooks/useStore.ts:36）：
// 因为 selector 每次返回新对象和新数组，默认 Object.is 会认为每次都变了；
// 这里比较三个字段的值，只要节点数、边数和选中 ID 列表没变，就返回 true 跳过重渲染。
function isSameSummary(a: StoreSummary, b: StoreSummary): boolean {
  return (
    a.nodeCount === b.nodeCount &&
    a.edgeCount === b.edgeCount &&
    a.selectedIds.length === b.selectedIds.length &&
    a.selectedIds.every((id, index) => id === b.selectedIds[index])
  )
}

// S1：精细的 Zustand selector，只从 store 中挑出节点数、边数和已选节点 id 列表。
// 配合上面的 isSameSummary 比较，拖动已选中的节点（只改 position，不改数量与选中列表）或平移画布时，
// 订阅该 selector 的状态栏组件不会跟着逐帧重渲染。
const summarySelector = (state: ReactFlowState): StoreSummary => ({
  nodeCount: state.nodes.length,
  edgeCount: state.edges.length,
  selectedIds: state.nodes.filter((node) => node.selected).map((node) => node.id),
})

// 画布外部的顶部状态栏：
// 注意它与下面的 StoreAndHooksCanvas 是平级兄弟组件，而不是 StoreAndHooksCanvas 的子组件！
// 如果把它放进 StoreAndHooksCanvas 内部，父组件每次更新 nodes state 都会顺带重渲染子组件，
// 再加上 StoreUpdater 在 useEffect 里把 props.nodes 同步进 store，就会导致一次点击触发两次重渲染。
function StoreInspectorBar() {
  // 统计组件实际提交（commit）渲染的次数：
  // src/main.tsx 开启了 <StrictMode>，开发环境下每次渲染都会把组件函数体调用 2 次；
  // 用 didRenderRef 配合 useEffect 计数，避免 StrictMode 把 1 次更新算成 +2。
  const commitCountRef = useRef(0)
  const didRenderRef = useRef(false)
  didRenderRef.current = true
  useEffect(() => {
    if (didRenderRef.current) {
      commitCountRef.current += 1
      didRenderRef.current = false
    }
  })
  const currentRenderCount = commitCountRef.current + 1

  // 1. useStore(selector, equalityFn)：响应式订阅 store 切片（hooks/useStore.ts:34）。
  // 只有当 selector 返回值经 isSameSummary 比较发生变化时，才会触发当前组件重渲染。
  const { nodeCount, edgeCount, selectedIds } = useStore(summarySelector, isSameSummary)

  // 2. useStoreApi()：拿到 { getState, setState, subscribe }（hooks/useStore.ts:60）。
  // 不订阅状态、不触发组件重渲染，适合在按钮点击等事件回调里「按需一次性读取」store 快照。
  const storeApi = useStoreApi()

  // 3. useReactFlow()：面向业务操作的高层实例（hooks/useReactFlow.ts:58）。
  // 组合了节点/边增删改查和视口方法，内部同样通过 useStoreApi 与 BatchProvider 工作。
  const reactFlow = useReactFlow()

  const handleDumpSnapshot = () => {
    // S2：用 storeApi.getState() 一次性读取当前 store 快照，不会触发 StoreInspectorBar 重渲染。
    const state = storeApi.getState()
    const [x, y, zoom] = state.transform
    console.log('[Store / 快照 useStoreApi.getState()]', {
      viewport: { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), zoom: Number(zoom.toFixed(2)) },
      nodeCount: state.nodes.length,
      edgeCount: state.edges.length,
      nodeLookupIds: Array.from(state.nodeLookup.keys()),
    })
  }

  const handleSelectAll = () => {
    // S3-a：用 reactFlow.setNodes 把所有节点的 selected 设为 true。
    // 内部推入 BatchProvider 的 nodeQueue，对比生成 select changes 交给画布的 onNodesChange。
    reactFlow.setNodes((currentNodes) =>
      currentNodes.map((node) => (node.selected ? node : { ...node, selected: true })),
    )
  }

  const handleAppendNode = () => {
    // S3-b：用 reactFlow.addNodes 新增一个节点，观察上方 nodeCount 变化与渲染次数 +1。
    const nextIndex = storeApi.getState().nodes.length + 1
    const newId = `n${nextIndex}`
    reactFlow.addNodes({
      id: newId,
      position: { x: ((nextIndex - 1) % 3) * 240, y: 160 + Math.floor((nextIndex - 4) / 3) * 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: `${newId.toUpperCase()} · 新增节点` },
    })
  }

  const handleReset = () => {
    reactFlow.setNodes(initialNodes)
    reactFlow.setEdges(initialEdges)
  }

  return (
    <div className="store-inspector-bar" aria-label="Store 状态订阅与操作面板">
      <div className="store-metrics">
        <span>节点数：<strong>{nodeCount}</strong></span>
        <span>边数：<strong>{edgeCount}</strong></span>
        <span>已选节点：<strong>{selectedIds.length > 0 ? selectedIds.join(', ') : '无'}</strong></span>
        <span className="store-render-count" title="拖动已选中的节点或平移画布时，这个数字不会增加">
          状态栏渲染次数：<strong>{currentRenderCount}</strong>
        </span>
      </div>
      <div className="header-actions">
        <div role="group" aria-label="按需读取与高层操作">
          <button type="button" onClick={handleDumpSnapshot}>
            读取 Store 快照（useStoreApi · S2）
          </button>
          <button type="button" onClick={handleSelectAll}>
            全选节点（useReactFlow · S3-a）
          </button>
          <button type="button" onClick={handleAppendNode}>
            新增节点（useReactFlow · S3-b）
          </button>
          <button type="button" onClick={handleReset}>
            恢复初始图
          </button>
        </div>
      </div>
    </div>
  )
}

// 画布组件单独持有受控的 nodes / edges 状态：
// 拖动节点时只有 StoreAndHooksCanvas 自己重渲染，不会通过父子渲染链波及外面的兄弟组件 StoreInspectorBar。
function StoreAndHooksCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <section className="flow-container" aria-label="Store 与 Hooks 练习画布">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </section>
  )
}

// ReactFlow 内部自带 Wrapper（container/ReactFlow/Wrapper.tsx:41）：
// 如果外层没有 Provider，它会在画布内部自动包一层，但那样画布外面的兄弟组件（如 StoreInspectorBar）就读不到 StoreContext（报错 001）。
// 所以只要画布外需要使用 Hooks，就必须显式在外层包上 ReactFlowProvider，并让状态栏与画布作为平级兄弟组件共享 StoreContext。
export default function StoreAndHooksExercise() {
  return (
    <ReactFlowProvider>
      <section className="app store-hooks-exercise">
        <header>
          <p className="eyebrow">ADVANCED USE / HOOKS, PROVIDERS & STATE MANAGEMENT</p>
          <h1>Store 与 Hooks：Provider 边界、切片订阅与按需读取</h1>
          <p className="description">React Flow 内部用 Zustand 保存状态。画布外的组件（如上方的状态栏）必须和 ReactFlow 放在同一个 ReactFlowProvider 下才能调用相关 Hooks。对比三种访问方式：useStore（响应式切片订阅）、useStoreApi（按需读取不触发重渲染）、useReactFlow（高层业务操作）。</p>
        </header>

        <StoreInspectorBar />
        <StoreAndHooksCanvas />

        <p className="app-footer">观察「状态栏渲染次数」：点击选中未选节点、全选、新增或删除节点时计数只 +1；拖动已经选中的节点、平移缩放画布或点击「读取 Store 快照」时，计数保持不变。</p>
      </section>
    </ReactFlowProvider>
  )
}
